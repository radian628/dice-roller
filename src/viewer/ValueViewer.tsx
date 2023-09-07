import { For, Match, Show, Switch } from "solid-js";
import {
  DRNumber,
  DRResult,
  DRValue,
  ErrorInfo,
  total,
} from "../evaluator.jsx";

export function ValueViewer(props: {
  value: () => DRValue;
  noTotal?: boolean;
}) {
  return (
    <Switch>
      <Match when={props.value().type === "Boolean"}>
        {props.value().data as boolean}
      </Match>
      <Match when={props.value().type === "Number"}>
        <For each={[...(props.value().data as Map<string, number>).entries()]}>
          {([damageType, damage], i) => {
            return (
              <span>
                {i() > 0 ? "\xa0+\xa0" : ""}
                {damage}&nbsp;{damageType}
              </span>
            );
          }}
        </For>
        <Show when={(props.value().data as Map<string, number>).size === 0}>
          0
        </Show>
        {props.noTotal ||
        (props.value().data as Map<string, number>).size <= 1 ? (
          ""
        ) : (
          <>
            &nbsp;<span>({total(props.value() as DRNumber)} total)</span>
          </>
        )}
      </Match>
    </Switch>
  );
}

export function ResultViewer(props: {
  value: () => DRResult;
  noTotal?: boolean;
}) {
  const type = () => props.value().type;

  return (
    <Switch>
      <Match when={type() === "Success"}>
        <ValueViewer value={() => props.value().data as DRValue}></ValueViewer>
      </Match>
      <Match when={type() === "Failure"}>
        <div class="dice-roller-value-error error">
          {(props.value().data as ErrorInfo).map((e) => e.reason).join("\n")}
        </div>
      </Match>
    </Switch>
  );
}
