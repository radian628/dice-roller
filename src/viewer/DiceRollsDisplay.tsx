import { For, Match, Show, Switch, createEffect } from "solid-js";
import { BinaryOpNode } from "../parser.jsx";
import { CalculationDisplay, CalculationDisplayProps } from "./viewer.jsx";
import { DRNumber, evaluateAST, total } from "../evaluator.jsx";

const SizeToBGImage: Record<number, string> = {
  4: "d4_1.blender.png",
  6: "d6_1.blender.png",
  8: "d8_1.blender.png",
  10: "d10_1.blender.png",
  12: "d12_1.blender.png",
  20: "d20_1.blender.png",
};

export function SingleDiceRoll(props: {
  size: () => number;
  value: () => number;
  evaluate: () => boolean;
  summarizationLevel: () => number;
}) {
  const bgImage = () => SizeToBGImage[props.size()] ?? "unknown_size.png";
  return (
    <Switch>
      <Match when={props.summarizationLevel() === 0}>
        <div
          class="dice-roll"
          style={{
            "background-image": `url(${bgImage()})`,
            "font-size": props.evaluate() ? "" : "75%",
          }}
        >
          {props.evaluate() ? props.value() : `d${props.size()}`}
        </div>
      </Match>
      <Match when={props.summarizationLevel() > 0}>
        <div class="vertical">
          {props.evaluate() ? props.value() : `d${props.size()}`}
        </div>
      </Match>
    </Switch>
  );
}

export function DiceRollsDisplay(props: CalculationDisplayProps<BinaryOpNode>) {
  const op = () => props.node().op;
  const left = () => props.node().left;
  const right = () => props.node().right;

  // TODO: error handling
  const diceSize = () =>
    total(evaluateAST(props.node().right, props.context()).data as DRNumber);

  const diceResults = () =>
    props.context().diceRollResults.get(props.node()) ?? [];

  return (
    <div class="vertical dice-rolls">
      <div class="dice-quantity horizontal">
        <CalculationDisplay
          context={props.context}
          node={left}
          state={props.state}
        ></CalculationDisplay>
        d
        <CalculationDisplay
          context={props.context}
          node={right}
          state={props.state}
        ></CalculationDisplay>
      </div>
      <div
        class="dice"
        ref={(el) => {
          createEffect(() => {
            el.style.gridTemplateColumns = `repeat(${Math.min(
              diceResults().length,
              6
            )}, 1fr)`;
          });
        }}
      >
        <For each={diceResults()}>
          {(result, i) => (
            <>
              <Show when={props.state().summarizationLevel > 0 && i() !== 0}>
                <div class="vertical-divider"></div>
              </Show>
              <SingleDiceRoll
                size={() => diceSize()}
                value={() => result}
                evaluate={() => props.state().evaluate}
                summarizationLevel={() => props.state().summarizationLevel}
              ></SingleDiceRoll>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
