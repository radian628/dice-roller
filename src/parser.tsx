import {
  Positioned,
  RopeIter,
  RopeLeaf,
  compilePattern,
  lexerFromString,
  makeParseletBuilder,
  matchToken,
  parserFromLexer,
  position,
  token,
} from "napg";

const patternToken = (pat: string) =>
  matchToken(compilePattern(pat), (str) => str, "Unrecognized character.");

// const binaryOp = patternToken(
//   "%+|%*|/|-|>=|<=|>|<|=|==|!=|beats|fails|and|or|&&|%|%||!|x|X|d|D"
// );

const binaryOp = patternToken(
  "%+|%*|/|-|>=|<=|>|<|=|==|!=|beats|fails|and|or|&&|%|%||!|x|X|d|D"
);
// const binaryOp = patternToken("3|beats|%+|d");
const damageType = patternToken("([a-zA-Z])+");
const openParen = patternToken("%(");
const closeParen = patternToken("%)");
const whitespace = patternToken("[\r\n \t]");
const variableName = patternToken("([a-zA-Z])([a-zA-Z0-9]*)");
const questionMark = patternToken("%?");
const colon = patternToken(":");
const comma = patternToken(",");
const integer = patternToken("[0-9]+");

function canonicalizeVarName(varName: string) {
  return varName[0] === "$" ? varName.slice(1) : varName;
}

export enum BinOps {
  Add = "Add",
  Sub = "Sub",
  Mul = "Mul",
  Div = "Div",
  GreaterThan = "GreaterThan",
  LessThan = "LessThan",
  Equal = "Equal",
  NotEqual = "NotEqual",
  GreaterEqual = "GreaterEqual",
  LessEqual = "LessEqual",
  And = "And",
  Or = "Or",
  Repeat = "Repeat",
  DiceRoll = "DiceRoll",
}

const bindingPowers: Record<BinOps, number> = {
  [BinOps.DiceRoll]: 50,
  [BinOps.Add]: 30,
  [BinOps.Sub]: 30,
  [BinOps.Mul]: 40,
  [BinOps.Div]: 40,
  [BinOps.GreaterThan]: 20,
  [BinOps.LessThan]: 20,
  [BinOps.Equal]: 20,
  [BinOps.NotEqual]: 20,
  [BinOps.GreaterEqual]: 20,
  [BinOps.LessEqual]: 20,
  [BinOps.And]: 10,
  [BinOps.Or]: 10,
  [BinOps.Repeat]: 0,
};

const BaseBindingPower = -20;
const DamageTypeBindingPower = 0;
const TernaryBindingPower = -10;

export type NumberNode = {
  number: number;
  type: "Number";
};

export type BinaryOpNode = {
  type: "BinaryOp";
  op: BinOps;
  left: PositionedNode;
  right: PositionedNode;
};

export type DamageTypeNode = {
  type: "DamageType";
  damageType: string;
  operand: PositionedNode;
};

export type FunctionCallNode = {
  type: "FunctionCall";
  functionName: string;
  arguments: PositionedNode[];
};

export type TernaryNode = {
  type: "TernaryNode";
  condition: PositionedNode;
  ifTrue: PositionedNode;
  ifFalse?: PositionedNode;
};

export type ErrorNode = {
  type: "Error";
  reason: string;
};

type NoErrorParseNode =
  | NumberNode
  | BinaryOpNode
  | DamageTypeNode
  | FunctionCallNode
  | TernaryNode;

export type ParseNode = NoErrorParseNode | ErrorNode;

export type PositionedNode = ParseNode & Positioned<string>;

type InitParseState = {
  bindingPower: number;
};

type ConsequentParseState = InitParseState & {
  left: PositionedNode;
};

// hash function for initialParseState
const hashIPS = (state: InitParseState) => {
  return state.bindingPower;
};

// "is equal?" function for initialParseState
const eqIPS = (a: InitParseState, b: InitParseState) => {
  return a.bindingPower === b.bindingPower;
};

type ParserTypes = {
  MyOutputType: ParseNode;
  Error: ErrorNode;
  ErrorMessage: string;
  SkipToken: string;
};

const parselet = makeParseletBuilder<ParserTypes>();

const symbolToBinaryOp: Record<string, BinOps> = {
  "+": BinOps.Add,
  "-": BinOps.Sub,
  "*": BinOps.Mul,
  "/": BinOps.Div,

  "&&": BinOps.And,
  and: BinOps.And,

  "||": BinOps.Or,
  or: BinOps.Or,

  ">": BinOps.GreaterThan,
  "<": BinOps.LessThan,
  fails: BinOps.LessThan,
  "==": BinOps.Equal,
  "!=": BinOps.NotEqual,
  ">=": BinOps.GreaterEqual,
  beats: BinOps.GreaterEqual,
  "<=": BinOps.LessEqual,

  x: BinOps.Repeat,
  X: BinOps.Repeat,

  d: BinOps.DiceRoll,
  D: BinOps.DiceRoll,
};

const consequentExpressionParselet = parselet<
  ConsequentParseState,
  NoErrorParseNode
>(
  (p) => {
    return p.lexMatch<string, ParseNode>(
      () => p.err("Expected a binary operator or a damage type."),
      [
        binaryOp,
        (first) => {
          const op = symbolToBinaryOp?.[first];
          const nextBindingPower = bindingPowers?.[op];

          if (nextBindingPower === undefined) {
            console.log(
              `Unrecognized operator '${first}'. The end user should not see this error.`
            );
            p.err("");
          }

          if (nextBindingPower <= p.state.bindingPower) p.err("");

          return {
            type: "BinaryOp",
            op,
            left: p.state.left,
            right: p.parse(expressionParselet, {
              bindingPower: nextBindingPower,
            }),
          };
        },
      ],
      [
        questionMark,
        (first) => {
          if (TernaryBindingPower <= p.state.bindingPower) p.err("");

          const ifTrue = p.parse(expressionParselet, {
            bindingPower: TernaryBindingPower,
          });
          let ifFalse: PositionedNode | undefined;
          if (p.isNext(colon)) {
            p.lex(colon);
            ifFalse = p.parse(expressionParselet, {
              bindingPower: TernaryBindingPower,
            });
          }

          return {
            type: "TernaryNode",
            condition: p.state.left,
            ifTrue,
            ifFalse,
          };
        },
      ],
      [
        damageType,
        (first) => {
          if (DamageTypeBindingPower <= p.state.bindingPower) p.err("");

          return {
            type: "DamageType",
            damageType: first,
            operand: p.state.left,
          };
        },
      ]
    );
  },
  (state) => {
    return state.bindingPower * 100000000 + state.left[position].id * 100000;
  },
  (a, b) => {
    return a.bindingPower === b.bindingPower && a.left === b.left;
  }
);

const initExpressionParselet = parselet<InitParseState, NoErrorParseNode>(
  (p): ParseNode => {
    return p.lexMatch<string, ParseNode>(
      () => p.err("Expected '(', a number, or a variable name."),
      [
        openParen,
        () => {
          const result = p.parse(expressionParselet, {
            bindingPower: BaseBindingPower,
          });
          p.lex(closeParen);
          return result;
        },
      ],
      [
        integer,
        (num) => {
          return { type: "Number", number: Number(num) };
        },
      ],
      [
        variableName,
        (varName) =>
          p.lexMatch<string, ParseNode>(() => {
            return {
              type: "FunctionCall",
              functionName: canonicalizeVarName(varName),
              arguments: [],
            };
          }, [
            openParen,
            () => {
              const getNext = () =>
                p.lexMatch<string, string>(
                  () =>
                    p.err(
                      "Expected ',' to separate function arguments or ')' to end the function."
                    ),
                  [comma, () => ","],
                  [closeParen, () => ")"]
                );

              const args: PositionedNode[] = [];

              do {
                args.push(
                  p.parse(expressionParselet, {
                    bindingPower: BaseBindingPower,
                  })
                );
              } while (getNext() !== ")");

              return {
                type: "FunctionCall",
                functionName: canonicalizeVarName(varName),
                arguments: args,
              };
            },
          ]),
      ]
    );
  },
  hashIPS,
  eqIPS
);

const expressionParselet = parselet<InitParseState, NoErrorParseNode>(
  (p): ParseNode => {
    let left = p.parse(initExpressionParselet, p.state);

    while (true) {
      const snapshot = p.getParserSnapshot();

      const nextParseNode = p.parse(consequentExpressionParselet, {
        bindingPower: p.state.bindingPower,
        left,
      });

      if (nextParseNode.type === "Error") {
        p.setParserSnapshot(snapshot);
        break;
      }

      left = nextParseNode;
    }

    return left;
  },
  hashIPS,
  eqIPS
);

export function makeDiceRollerParser(src: RopeIter) {
  const lexer = lexerFromString(src);

  return parserFromLexer(
    lexer,
    { bindingPower: BaseBindingPower },
    expressionParselet,
    [whitespace],
    {
      // Converts an error message to a full error node
      makeErrorMessage(msg) {
        return { type: "Error", reason: msg } satisfies ErrorNode;
      },
      // Converts a lexer error to a full error node
      makeLexerError(pos) {
        return {
          type: "Error",
          reason: `Lexer error at position ${pos}`,
        } satisfies ErrorNode;
      },
      // Converts an arbitrary error with an unknown type (since you can throw anything)
      // into an error node.
      makeUnhandledError(err) {
        return {
          type: "Error",
          reason: `Unhandled internal error: ${JSON.stringify(err)} `,
        } satisfies ErrorNode;
      },
      // Detects if a node is an error node.
      isErr(err): err is ErrorNode {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (err as any).type === "Error";
      },
    }
  );
}

// Parse a string into a four-function calculator syntax tree
export function parseDiceRoller(src: string) {
  // Create the parser
  const parser = makeDiceRollerParser(new RopeLeaf(src).iter(0));

  // Run the parser. The callback here is just used for cache invalidation.
  const parserOutput = parser.exec(() => true);

  return parserOutput;
}
