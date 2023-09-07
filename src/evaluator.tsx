import { Positioned } from "napg";
import {
  BinOps,
  BinaryOpNode,
  FunctionCallNode,
  PositionedNode,
} from "./parser.jsx";
import { MultilayerMap, makeMultilayerMap } from "./multilayer-map.js";
import { cloneAST } from "./clone-ast.js";
import { JSX } from "solid-js/jsx-runtime";
import { CalculationDisplayProps } from "./viewer/viewer.jsx";

export type ErrorInfo = {
  reason: string;
  node: PositionedNode;
}[];

export type DRNumber = {
  type: "Number";
  // maps a damage type to a damage value
  data: Map<string, number>;
};

export type DRBoolean = {
  type: "Boolean";
  data: boolean;
};

export type DRValue = DRNumber | DRBoolean;

export const drData = {
  number: (data: Map<string, number>): DRNumber => ({
    type: "Number",
    data,
  }),
  boolean: (data: boolean): DRBoolean => ({ type: "Boolean", data }),
};

export type DRSuccess = {
  data: DRValue;
  type: "Success";
};

export type DRFailure = {
  data: ErrorInfo;
  type: "Failure";
};

export type DRResult = DRSuccess | DRFailure;

export type Warning = string;

export type DiceRollerFunction = (
  call: Positioned<string> & FunctionCallNode,
  ctx: EvaluationContext
) => {
  result: DRResult;
  component: (props: CalculationDisplayProps<FunctionCallNode>) => JSX.Element;
};

export type EvaluationContext = {
  functions: Map<string, DiceRollerFunction>;
  functionComponents: Map<
    PositionedNode,
    (props: CalculationDisplayProps<FunctionCallNode>) => JSX.Element
  >;
  warnings: Map<PositionedNode, Warning>;
  cache: Map<PositionedNode, DRResult>;
  diceRollResults: Map<PositionedNode, number[]>;
  repeatClones: Map<PositionedNode, PositionedNode[]>;
};

export const success = (v: DRValue): DRSuccess => ({
  type: "Success",
  data: v,
});
export const failure = (errs: ErrorInfo): DRFailure => ({
  type: "Failure",
  data: errs,
});
export const errInfo = (reason: string, node: PositionedNode) => ({
  reason,
  node,
});

function mapOverASTChildren<T>(
  node: PositionedNode,
  callback: (node: PositionedNode) => T
) {
  switch (node.type) {
    case "BinaryOp":
      callback(node.left);
      callback(node.right);
      break;
    case "DamageType":
      callback(node.operand);
      break;
    case "Error":
      break;
    case "FunctionCall":
      for (const arg of node.arguments) {
        callback(arg);
      }
    case "Number":
      break;
    case "TernaryNode":
      callback(node.condition);
      callback(node.ifTrue);
      if (node.ifFalse) callback(node.ifFalse);
      break;
  }
}

function consolidateErrors(node: PositionedNode) {
  function mapOverNodeAndFindErrors(node: PositionedNode): PositionedNode[] {
    let errors: PositionedNode[] = [];

    if (node.type === "Error") {
      errors.push(node);
    }

    mapOverASTChildren(node, (child) => {
      errors.push(...mapOverNodeAndFindErrors(child));
    });

    return errors;
  }

  return mapOverNodeAndFindErrors(node);
}

function filterFailsAndSuccesses(results: DRResult[]): [ErrorInfo, DRValue[]] {
  return [
    results
      .filter((r) => r.type === "Failure")
      .map((d) => d.data as ErrorInfo)
      .flat(1),
    (results.filter((r) => r.type === "Success") as DRSuccess[]).map(
      (s) => s.data
    ),
  ];
}

function applyBinOpToNumbers(
  a: DRNumber,
  b: DRNumber,
  fn: (a: number, b: number) => number,
  damageType: (a: string) => string
) {
  const allDamageTypes = new Set([...a.data.keys(), ...b.data.keys()]);

  const newNumberData = new Map<string, number>();

  for (const dt of allDamageTypes) {
    const entryA = a.data.get(dt);
    const entryB = b.data.get(dt);

    newNumberData.set(damageType(dt), fn(entryA ?? 0, entryB ?? 0));
  }

  return drData.number(newNumberData);
}

function foil(
  a: DRNumber,
  b: DRNumber,
  fn: (a: number, b: number) => number,
  damageType: (a: string, b: string) => string
) {
  const newNumberData = new Map<string, number>();

  for (const [damageTypeA, damageA] of a.data) {
    for (const [damageTypeB, damageB] of b.data) {
      newNumberData.set(
        damageType(damageTypeA, damageTypeB),
        fn(damageA, damageB)
      );
    }
  }

  return drData.number(newNumberData);
}

function hasNoDamageType(n: DRNumber) {
  return n.data.size === 0 || (n.data.size === 1 && n.data.has(""));
}

export function total(n: DRNumber) {
  return [...n.data.values()].reduce((prev, curr) => prev + curr, 0);
}

function equal(a: DRValue, b: DRValue) {
  if (a.type !== b.type) return false;

  if (a.type === "Boolean" && a.data !== b.data) return false;

  if (a.type === "Number" && b.type === "Number") {
    const allDamageTypes = new Set(...a.data.keys(), ...b.data.keys());

    for (const type of allDamageTypes) {
      const valueA = a.data.get(type) ?? 0;
      const valueB = a.data.get(type) ?? 0;
      if (valueA !== valueB) return false;
    }
  }

  return true;
}

function evaluateBinaryOperation(
  node: BinaryOpNode & Positioned<string>,
  context: EvaluationContext
): DRResult {
  const leftMaybeErr = evaluateAST(node.left, context);
  const rightMaybeErr = evaluateAST(node.right, context);

  const [errors, [left, right]] = filterFailsAndSuccesses([
    leftMaybeErr,
    rightMaybeErr,
  ]);

  if (errors.length > 0) return failure(errors);

  switch (node.op) {
    case BinOps.And:
    case BinOps.Or:
      if (left.type !== "Boolean" || right.type !== "Boolean") {
        return failure([
          errInfo(
            `The '${node.op}' operator may only occur between two numbers`,
            node
          ),
        ]);
      }
      switch (node.op) {
        case BinOps.And:
          return success(drData.boolean(left.data && right.data));
        case BinOps.Or:
          return success(drData.boolean(left.data || right.data));
      }

    case BinOps.Equal:
      return success(drData.boolean(equal(left, right)));
    case BinOps.NotEqual:
      return success(drData.boolean(!equal(left, right)));

    case BinOps.Add:
    case BinOps.Sub:
    case BinOps.Mul:
    case BinOps.Div:
    case BinOps.GreaterThan:
    case BinOps.LessThan:
    case BinOps.GreaterEqual:
    case BinOps.LessEqual:
    case BinOps.DiceRoll:
    case BinOps.Repeat:
      if (left.type !== "Number" || right.type !== "Number") {
        return failure([
          errInfo(
            `The '${node.op}' operator may only occur between two numbers`,
            node
          ),
        ]);
      }
      switch (node.op) {
        case BinOps.Add:
        case BinOps.Sub:
          return success(
            applyBinOpToNumbers(
              left,
              right,
              (a, b) => (node.op === BinOps.Add ? a + b : a - b),
              (a) => a
            )
          );

        case BinOps.Mul:
          if (!hasNoDamageType(left) && !hasNoDamageType(right)) {
            context.warnings.set(
              node,
              `Multiplying two operands with damage types. You may get an unexpected answer.`
            );
          }
          return success(
            foil(
              left,
              right,
              (a, b) => (node.op === BinOps.Mul ? a * b : a / b),
              (a, b) => `${a} ${b}`.trim()
            )
          );

        case BinOps.Div:
          if (!hasNoDamageType(right)) {
            context.warnings.set(
              node,
              `Dividing by an operand with damage types. You may get an unexpected answer.`
            );
          }
          const newNumberData = new Map(left.data);
          const rightTotal = total(right);
          for (const [k, v] of newNumberData)
            newNumberData.set(k, Math.floor(v / rightTotal));

          return success(drData.number(newNumberData));

        case BinOps.GreaterThan:
        case BinOps.LessThan:
        case BinOps.GreaterEqual:
        case BinOps.LessEqual: {
          const leftTotal = total(left);
          const rightTotal = total(right);
          return success(
            drData.boolean(
              {
                [BinOps.GreaterThan]: (a: number, b: number) => a > b,
                [BinOps.LessThan]: (a: number, b: number) => a < b,
                [BinOps.GreaterEqual]: (a: number, b: number) => a >= b,
                [BinOps.LessEqual]: (a: number, b: number) => a <= b,
              }[node.op](leftTotal, rightTotal)
            )
          );
        }

        case BinOps.DiceRoll: {
          if (!hasNoDamageType(left) || !hasNoDamageType(right)) {
            context.warnings.set(
              node,
              `Performing a dice roll with a damage type for its dice count and/or dice size. You may get an unexpected answer.`
            );
          }
          let diceRollTotal = 0;
          const dieSize = total(right);
          console.log(node, dieSize);
          const results = [];
          for (let i = 0; i < total(left); i++) {
            const result = Math.floor(Math.random() * dieSize) + 1;
            results.push(result);
            diceRollTotal += result;
          }
          context.diceRollResults.set(node, results);
          return success(drData.number(new Map([["", diceRollTotal]])));
        }

        case BinOps.Repeat: {
          if (!hasNoDamageType(right)) {
            context.warnings.set(
              node,
              `Repeating a calculation a number of times with a damage type. You may get an unexpected answer.`
            );
          }

          const totalRight = total(right);

          const recalculatedCopies: DRResult[] = [];
          const clones: PositionedNode[] = [];

          for (let i = 0; i < totalRight; i++) {
            const clone = cloneAST(node.left);
            recalculatedCopies.push(evaluateAST(clone, context));
            clones.push(clone);
          }

          context.repeatClones.set(node, clones);

          const [errors, successes] =
            filterFailsAndSuccesses(recalculatedCopies);

          if (errors.length > 0) return failure(errors);

          const numbers = successes.filter(
            (suc) => suc.type === "Number"
          ) as DRNumber[];

          if (successes.length !== numbers.length) {
            return failure([
              errInfo(
                "Expected all operands in a repetition operation to be numbers.",
                node
              ),
            ]);
          }

          return success(
            numbers.reduce(
              (prev, curr) =>
                applyBinOpToNumbers(
                  prev,
                  curr,
                  (a, b) => a + b,
                  (a) => a
                ),
              drData.number(new Map())
            )
          );
        }
      }
    //   return success({
    //     type: "Number"
    //   });
    // {
    //     [BinOps.Add]: (a: number, b: number) => a + b,
    //     [BinOps.Sub]: (a: number, b: number) => a - b,
    //     [BinOps.Mul]: (a: number, b: number) => a * b,
    //     [BinOps.Div]: (a: number, b: number) => a / b,
    //   }[node.op](left.data, right.data)
  }
}

function applyDamageType(num: DRNumber, damageType: string): DRNumber {
  const newNum = new Map(num.data);

  const typelessDamage = newNum.get("") ?? 0;
  newNum.set(damageType, typelessDamage);
  newNum.delete("");

  return drData.number(newNum);
}

function evaluateASTNoCache(
  node: PositionedNode,
  context: EvaluationContext
): DRResult {
  switch (node.type) {
    case "BinaryOp":
      return evaluateBinaryOperation(node, context);
    case "DamageType":
      const operand = evaluateAST(node.operand, context);

      if (operand.type === "Failure") return operand;

      if (operand.data.type === "Boolean")
        return failure([
          errInfo(
            "Cannot apply damage types to boolean (true/false) values.",
            node
          ),
        ]);

      return success(applyDamageType(operand.data, node.damageType));
    case "Error":
      return failure([errInfo(node.reason, node)]);
    case "FunctionCall":
      const fn = context.functions.get(node.functionName);

      if (!fn)
        return failure([
          errInfo(`'${node.functionName}' does not exist`, node),
        ]);

      const ret = fn(node, context);

      context.functionComponents.set(node, ret.component);

      return ret.result;
    case "Number":
      return success(drData.number(new Map([["", node.number]])));
    case "TernaryNode":
      const condition = evaluateAST(node.condition, context);
      const ifTrue = evaluateAST(node.ifTrue, context);
      const ifFalse = node.ifFalse
        ? evaluateAST(node.ifFalse, context)
        : success(drData.number(new Map()));

      if (condition.type === "Failure") return condition;

      if (condition) {
        return ifTrue;
      } else {
        return ifFalse;
      }
  }
}

const cachedEvaluations = makeMultilayerMap();

export function evaluateAST(node: PositionedNode, context: EvaluationContext) {
  const cachedValue = context.cache.get(node);
  if (cachedValue) return cachedValue;

  const evaluatedValue = evaluateASTNoCache(node, context);
  context.cache.set(node, evaluatedValue);
  return evaluatedValue;
}
