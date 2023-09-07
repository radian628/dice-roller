import { Positioned } from "napg";
import {
  DiceRollerFunction,
  EvaluationContext,
  drData,
  evaluateAST,
  success,
  total,
} from "../evaluator.jsx";
import { FunctionCallNode } from "../parser.jsx";
import { CalculationDisplay } from "../viewer/viewer.jsx";
import { Show } from "solid-js";

export const attack: DiceRollerFunction = (
  call: Positioned<string> & FunctionCallNode,
  evaluationCtx: EvaluationContext
) => {
  const [attackRoll, ac, damage] = call.arguments;

  console.log("call", call.arguments);

  const d20roll = Math.floor(Math.random() * 20) + 1;

  const attackRollResult = evaluateAST(attackRoll, evaluationCtx);

  if (
    attackRollResult.type === "Failure" ||
    attackRollResult.data.type === "Boolean"
  ) {
    return {
      result: attackRollResult,
      component: (props) => (
        <div class="error">
          Attack roll calculation caused an error:
          <CalculationDisplay
            state={props.state}
            node={() => attackRoll}
            context={props.context}
          ></CalculationDisplay>
        </div>
      ),
    };
  }

  const acResult = evaluateAST(ac, evaluationCtx);

  if (acResult.type === "Failure" || acResult.data.type === "Boolean") {
    return {
      result: acResult,
      component: (props) => (
        <div class="error">
          AC calculation caused an error:
          <CalculationDisplay
            state={props.state}
            node={() => ac}
            context={props.context}
          ></CalculationDisplay>
        </div>
      ),
    };
  }

  const attackRollAmount = total(attackRollResult.data);

  const evaluatedDamage = evaluateAST(damage, evaluationCtx);

  const didHit = attackRollAmount >= total(acResult.data);
  const damageDealt = didHit
    ? evaluatedDamage
    : success(drData.number(new Map()));

  return {
    result: damageDealt,
    component: (props) => {
      console.log("props", props.node());
      return (
        <div class="horizontal">
          <div class="horizontal">
            <CalculationDisplay
              state={props.state}
              context={props.context}
              node={() => attackRoll}
            ></CalculationDisplay>
            &nbsp;
            <Show when={props.state().evaluate}>=&nbsp;{attackRollAmount}</Show>
          </div>
          <div class="horizontal">
            &nbsp;vs&nbsp;
            <CalculationDisplay
              state={props.state}
              context={props.context}
              node={() => ac}
            ></CalculationDisplay>
            &nbsp;AC
          </div>
          <Show when={props.state().evaluate}>
            <div class="vertical-divider"></div>
            {didHit ? "Hit!" : "Miss"}
          </Show>
          <div class="vertical-divider"></div>
          <Show when={didHit || !props.state().evaluate}>
            <CalculationDisplay
              state={props.state}
              context={props.context}
              node={() => damage}
            ></CalculationDisplay>
          </Show>
          <Show when={!didHit && props.state().evaluate}>0 damage</Show>
        </div>
      );
    },
  };
};
