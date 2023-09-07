import { Match, Switch } from "solid-js";
import { cloneAST } from "../clone-ast.js";
import { DiceRollerFunction, evaluateAST, total } from "../evaluator.jsx";
import { CalculationDisplay } from "../viewer/viewer.jsx";

export const advantage: DiceRollerFunction = (call, evaluationCtx) => {
  const [operand] = call.arguments;

  const try1Node = operand;
  const try1 = evaluateAST(operand, evaluationCtx);
  const try2Node = cloneAST(operand);
  const try2 = evaluateAST(try2Node, evaluationCtx);

  if (try1.type === "Failure" || try1.data.type !== "Number") {
    return {
      result: try1,
      component: (props) => (
        <div class="error">
          Error while trying to roll with advantage.
          <CalculationDisplay
            state={props.state}
            node={() => try1Node}
            context={props.context}
          ></CalculationDisplay>
        </div>
      ),
    };
  }

  if (try2.type === "Failure" || try2.data.type !== "Number") {
    return {
      result: try2,
      component: (props) => (
        <div class="error">
          Error while trying to roll with advantage.
          <CalculationDisplay
            state={props.state}
            node={() => try2Node}
            context={props.context}
          ></CalculationDisplay>
        </div>
      ),
    };
  }

  return {
    result: total(try1.data) > total(try2.data) ? try1 : try2,
    component: (props) => {
      return (
        <Switch>
          <Match when={props.state().summarizationLevel === 0}>
            <div>
              <div class="horizontal">
                <CalculationDisplay
                  state={props.state}
                  node={() => try1Node}
                  context={props.context}
                ></CalculationDisplay>
                <div class="vertical-divider"></div>
                <CalculationDisplay
                  state={props.state}
                  node={() => try2Node}
                  context={props.context}
                ></CalculationDisplay>
                &nbsp;
              </div>
            </div>
          </Match>
          <Match when={props.state().summarizationLevel >= 1}>
            <div>Advantage</div>
          </Match>
        </Switch>
      );
    },
  };
};
