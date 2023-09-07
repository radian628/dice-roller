import { For, Show } from "solid-js";
import { evaluateAST } from "../evaluator.jsx";
import { BinaryOpNode } from "../parser.jsx";
import { ResultViewer } from "./ValueViewer.jsx";
import { CalculationDisplay, CalculationDisplayProps } from "./viewer.jsx";

const RepeatSummarizationThreshold = 10;

export function RepeatViewer(props: CalculationDisplayProps<BinaryOpNode>) {
  const count = () => evaluateAST(props.node().right, props.context());

  const repeatClones = () =>
    props.context().repeatClones.get(props.node()) ?? [];

  return (
    <div class="binary-op-display vertical repeat-container">
      <Show when={repeatClones().length > RepeatSummarizationThreshold}>
        <div class="horizontal repeat-description">
          <CalculationDisplay
            context={props.context}
            node={() => props.node().left}
            state={() => ({ ...props.state(), evaluate: false })}
          ></CalculationDisplay>
          <div class="vertical-divider"></div>
          <span class="bigtext">
            x<ResultViewer value={() => count()}></ResultViewer>
          </span>
        </div>
        <div class="divider"></div>
      </Show>
      <table class="repeat-table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Total</th>
          </tr>
        </thead>
        <For each={repeatClones()}>
          {(result) => (
            <tr>
              <td class="horizontal">
                <CalculationDisplay
                  context={props.context}
                  node={() => result}
                  state={() => ({
                    ...props.state(),
                    summarizationLevel:
                      props.state().summarizationLevel +
                      (repeatClones().length > RepeatSummarizationThreshold
                        ? 1
                        : 0),
                  })}
                ></CalculationDisplay>
              </td>
              <td>
                <ResultViewer
                  value={() => evaluateAST(result, props.context())}
                ></ResultViewer>
              </td>
            </tr>
          )}
        </For>
      </table>
    </div>
  );
}
