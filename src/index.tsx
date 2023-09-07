import { parseDiceRoller } from "./parser.jsx";
import { Match, Show, Switch, render } from "solid-js/web";
import "./index.less";
import {
  EvaluationContext,
  drData,
  errInfo,
  evaluateAST,
  failure,
  success,
  total,
} from "./evaluator.jsx";
import { makeMultilayerMap } from "./multilayer-map.js";
import {
  CalculationDisplay,
  RootCalculationDisplay,
} from "./viewer/viewer.jsx";
import { SingleDiceRoll } from "./viewer/DiceRollsDisplay.jsx";
import { ResultViewer } from "./viewer/ValueViewer.jsx";
import { cloneAST } from "./clone-ast.js";
import { attack } from "./functions/attack.jsx";
import { advantage } from "./functions/advantage.jsx";
import { DiceRollerREPL } from "./repl/repl.jsx";

console.log(parseDiceRoller("3d6 slashing"));
console.log(parseDiceRoller("adv(1d20 + 7)"));

// const ast = parseDiceRoller(
//   "(1d12 + 1 x3) + (3 * 1d8 + 3d4 fire + 2d6 + 1 slashing) / 2"
// );

// const ast = parseDiceRoller("2d6 + 5 slashing + 2d6 fire x4");

const ast = parseDiceRoller(
  `(attack(adv(1d20+4), 15, 1d6+2 piercing) x16)
   + (attack(adv(1d20+4), 15, 1d4+2 slashing) x16)`
);

// const ast = parseDiceRoller("3d6 + sdasd 2 bludgeoning");
// const ast = parseDiceRoller("attack(1d20+17, 21, 2d4 piercing)");

console.log(ast);

const evaluationCtx: EvaluationContext = {
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

evaluateAST(ast, evaluationCtx);
console.log("ctx", evaluationCtx);

render(
  () => (
    // <div>
    //   <div class="root-dice-roller-display">
    //     <RootCalculationDisplay
    //       node={() => ast}
    //       context={() => evaluationCtx}
    //       state={() => ({ evaluate: true, summarizationLevel: 0 })}
    //     ></RootCalculationDisplay>
    //   </div>
    // </div>
    <DiceRollerREPL></DiceRollerREPL>
  ),
  document.getElementById("main")!
);
