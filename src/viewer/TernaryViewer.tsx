import { Show } from "solid-js";
import { PositionedNode, TernaryNode } from "../parser.jsx";
import { CalculationDisplay, CalculationDisplayProps } from "./viewer.jsx";
import { DRValue, evaluateAST } from "../evaluator.jsx";

export function TernaryViewer(props: CalculationDisplayProps<TernaryNode>) {
  const condition = () =>
    (evaluateAST(props.node().condition, props.context()).data as DRValue).data;

  console.log(props.node().condition);

  return (
    <div class="horizontal">
      Is&nbsp;
      <CalculationDisplay
        node={() => props.node().condition}
        context={props.context}
        state={props.state}
      ></CalculationDisplay>
      <div class="vertical-divider"></div>
      <div
        class="vertical"
        style={{
          opacity: condition() ? 1 : 0.5,
        }}
      >
        Yes
        <CalculationDisplay
          node={() => props.node().ifTrue}
          context={props.context}
          state={props.state}
        ></CalculationDisplay>
      </div>
      <Show when={props.node().ifFalse}>
        <div class="vertical-divider"></div>
        <div
          class="vertical"
          style={{
            opacity: condition() ? 0.5 : 1,
          }}
        >
          No
          <CalculationDisplay
            node={() => props.node().ifFalse as PositionedNode}
            context={props.context}
            state={props.state}
          ></CalculationDisplay>
        </div>
      </Show>
    </div>
  );
}
