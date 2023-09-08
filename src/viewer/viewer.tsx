import { Positioned } from "napg";
import {
  BinOps,
  BinaryOpNode,
  DamageTypeNode,
  FunctionCallNode,
  NumberNode,
  ParseNode,
  TernaryNode,
} from "../parser.jsx";
import "./viewer.less";
import { EvaluationContext, evaluateAST, total } from "../evaluator.jsx";
import { Match, Switch } from "solid-js";
import { DiceRollsDisplay } from "./DiceRollsDisplay.jsx";
import { ResultViewer, ValueViewer } from "./ValueViewer.jsx";
import { RepeatViewer } from "./RepeatViewer.jsx";
import { TernaryViewer } from "./TernaryViewer.jsx";

export type CalculationDisplayState = {
  evaluate: boolean;
  summarizationLevel: number;
};

export type CalculationDisplayProps<NodeType extends ParseNode> = {
  node: () => Positioned<string> & NodeType;
  context: () => EvaluationContext;
  state: () => CalculationDisplayState;
};

export function RootCalculationDisplay(
  props: CalculationDisplayProps<ParseNode>
) {
  const value = () => evaluateAST(props.node(), props.context());

  return (
    <div
      class="root-dice-roller-display horizontal"
      style={{
        "background-color": "var(--highlight-background)",
      }}
      ref={(el) => {
        setTimeout(() => {
          el.style.backgroundColor = "var(--background)";
        }, 10);
      }}
    >
      <CalculationDisplay {...props}></CalculationDisplay>
      &nbsp;=&nbsp;
      <ResultViewer value={value}></ResultViewer>
    </div>
  );
}

export function CalculationDisplay(props: CalculationDisplayProps<ParseNode>) {
  const type = () => props.node().type;

  return (
    <>
      <Switch>
        <Match when={type() === "BinaryOp"}>
          <BinaryOpDisplay
            {...(props as CalculationDisplayProps<BinaryOpNode>)}
          ></BinaryOpDisplay>
        </Match>
        <Match when={type() === "Number"}>
          <NumberDisplay
            {...(props as CalculationDisplayProps<NumberNode>)}
          ></NumberDisplay>
        </Match>
        <Match when={type() === "DamageType"}>
          <DamageTypeDisplay
            {...(props as CalculationDisplayProps<DamageTypeNode>)}
          ></DamageTypeDisplay>
        </Match>
        <Match when={type() === "FunctionCall"}>
          {props.context().functionComponents.get(props.node())?.(
            props as CalculationDisplayProps<FunctionCallNode>
          ) ?? (
            <div class="error">
              Unrecognized function/variable '
              {(props.node() as FunctionCallNode).functionName}'
            </div>
          )}
        </Match>
        <Match when={type() === "TernaryNode"}>
          <TernaryViewer
            {...(props as CalculationDisplayProps<TernaryNode>)}
          ></TernaryViewer>
        </Match>
      </Switch>
    </>
  );
}

export function BinaryOpDisplay(props: CalculationDisplayProps<BinaryOpNode>) {
  const op = () => props.node().op;
  const left = () => props.node().left;
  const right = () => props.node().right;
  return (
    <>
      <Switch>
        <Match
          when={
            op() === BinOps.Add ||
            op() === BinOps.Sub ||
            op() === BinOps.Mul ||
            op() === BinOps.GreaterThan ||
            op() === BinOps.LessThan ||
            op() === BinOps.GreaterEqual ||
            op() === BinOps.LessEqual ||
            op() === BinOps.And ||
            op() === BinOps.Or
          }
        >
          <div class="horizontal binary-op-display">
            <CalculationDisplay
              context={props.context}
              node={left}
              state={props.state}
            ></CalculationDisplay>
            &nbsp;
            {
              (
                {
                  [BinOps.Add]: "+",
                  [BinOps.Sub]: "-",
                  [BinOps.Mul]: "×",
                  [BinOps.GreaterThan]: ">",
                  [BinOps.LessThan]: "<",
                  [BinOps.GreaterEqual]: "≥",
                  [BinOps.LessEqual]: "≤",
                  [BinOps.And]: "and",
                  [BinOps.Or]: "or",
                } as any
              )[op()]
            }
            &nbsp;
            <CalculationDisplay
              context={props.context}
              node={right}
              state={props.state}
            ></CalculationDisplay>
          </div>
        </Match>
        <Match when={op() === BinOps.DiceRoll}>
          <DiceRollsDisplay {...props}></DiceRollsDisplay>
        </Match>
        <Match when={op() === BinOps.Repeat}>
          <RepeatViewer {...props}></RepeatViewer>
        </Match>
        <Match when={op() === BinOps.Div}>
          <div class="vertical binary-op-display">
            <CalculationDisplay
              context={props.context}
              node={left}
              state={props.state}
            ></CalculationDisplay>
            <div class="vinculum"></div>
            <CalculationDisplay
              context={props.context}
              node={right}
              state={props.state}
            ></CalculationDisplay>
          </div>
        </Match>
      </Switch>
    </>
  );
}

export function NumberDisplay(props: CalculationDisplayProps<NumberNode>) {
  return <div>{props.node().number}</div>;
}

export function DamageTypeDisplay(
  props: CalculationDisplayProps<DamageTypeNode>
) {
  return (
    <div class="horizontal damage-type">
      <CalculationDisplay
        context={props.context}
        node={() => props.node().operand}
        state={props.state}
      ></CalculationDisplay>
      &nbsp;
      {props.node().damageType}
    </div>
  );
}
