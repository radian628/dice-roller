import { isMobile } from "is-mobile";
import { JSXElement, Show } from "solid-js";

export function MobileOnly(props: { children: JSXElement }) {
  return <Show when={isMobile()}>{props.children}</Show>;
}

export function DesktopOnly(props: { children: JSXElement }) {
  return <Show when={!isMobile()}>{props.children}</Show>;
}
