import { For, createEffect, createSignal } from "solid-js";
import { EvaluationContext, evaluateAST } from "../evaluator.jsx";
import { PositionedNode, parseDiceRoller } from "../parser.jsx";
import { RootCalculationDisplay } from "../viewer/viewer.jsx";
import { advantage } from "../functions/advantage.jsx";
import { attack } from "../functions/attack.jsx";
import "./repl.less";

export function DiceRollerREPL() {
  const [evaluations, setEvaluations] = createSignal<
    {
      ctx: EvaluationContext;
      ast: PositionedNode;
    }[]
  >([]);

  const [code, setCode] = createSignal("3d6 + 5");

  const handleSubmit = () => {
    const ast = parseDiceRoller(code());
    const ctx: EvaluationContext = {
      functions: new Map([
        ["adv", advantage],
        ["attack", attack],
      ]),
      functionComponents: new Map(),
      warnings: new Map(),
      cache: new Map(),
      diceRollResults: new Map(),
      repeatClones: new Map(),
    };
    evaluateAST(ast, ctx);
    setEvaluations([
      ...evaluations(),
      {
        ast,
        ctx,
      },
    ]);
  };

  return (
    <div class="repl">
      <div
        class="repl-evaluations"
        ref={(el) => {
          createEffect(() => {
            evaluations();
            console.log("got here");
            el.scrollTo({
              top: 2147483647,
              behavior: "smooth",
            });
          });
        }}
      >
        <For each={evaluations()}>
          {({ ctx, ast }) => (
            <RootCalculationDisplay
              context={() => ctx}
              node={() => ast}
              state={() => ({ summarizationLevel: 0, evaluate: true })}
            ></RootCalculationDisplay>
          )}
        </For>
      </div>
      <textarea
        class="repl-input"
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !evt.shiftKey) {
            handleSubmit();
            evt.preventDefault();
          }
        }}
        onInput={(evt) => {
          setCode(evt.currentTarget.value);
        }}
        value={code()}
      ></textarea>
    </div>
  );
}
