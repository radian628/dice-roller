import { EditorState, Extension, Range, RangeSet } from "@codemirror/state";
import {
  EditorView,
  keymap,
  Decoration,
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
  PluginValue,
} from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { createEffect, untrack } from "solid-js";
import { PositionedNode, parseDiceRoller } from "../parser.jsx";
import { position } from "napg";
import { tags, Tag } from "@lezer/highlight";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { mapOverASTChildren } from "../evaluator.jsx";
import { linter, Diagnostic } from "@codemirror/lint";

function getDiceRollerSyntaxHighlightingFromAST(ast: PositionedNode) {
  const decorations: Range<Decoration>[] = [];

  function map(node: PositionedNode) {
    const markNode = (tags: Tag, count?: number) => {
      const startIndex = node[position].start.index();
      decorations.push(
        Decoration.mark({
          class: defaultHighlightStyle.style([tags]) ?? undefined,
        }).range(startIndex, startIndex + (count ?? node[position].length))
      );
    };

    if (node.type === "Number") {
      markNode(tags.number);
    }

    // if (node.type === "BinaryOp") {
    //   markNode(tags.operator);
    // }

    if (node.type === "FunctionCall") {
      markNode(tags.keyword, node.functionName.length);
    }

    mapOverASTChildren(node, map);
  }

  map(ast);

  return RangeSet.of(decorations, true);
}

function getDiceRollerSyntaxHighlightingFromString(src: string) {
  return getDiceRollerSyntaxHighlightingFromAST(parseDiceRoller(src));
}

function diceRollerSyntaxHighlighterPlugin() {
  let decorations = RangeSet.of<Decoration>([]);

  return ViewPlugin.define(
    (view) => {
      return {
        update(update) {
          decorations = getDiceRollerSyntaxHighlightingFromString(
            update.view.state.doc.toString()
          );

          return decorations;
        },
      };
    },
    {
      decorations(update) {
        console.log("DECORATIONS", decorations);
        return decorations;
      },
    }
  );
}

function diceRollerDiagnosticPlugin() {
  return linter((view) => {
    const diagnostics: Diagnostic[] = [];
    function map(node: PositionedNode) {
      if (node.type === "Error") {
        const from = node[position].start.index();
        diagnostics.push({
          from,
          to: from + node[position].length,
          severity: "error",
          message: node.reason,
        });
      }

      mapOverASTChildren(node, map);
    }

    map(parseDiceRoller(view.state.doc.toString()));

    return diagnostics;
  });
}

export function CodeInput(props: {
  code: () => string;
  setCode: (code: string) => void;
  run: () => void;
}) {
  return (
    <div class="horizontal">
      <div
        class="repl-input"
        ref={(el) => {
          const extensions: () => Extension = () => [
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            keymap.of([
              {
                key: "Enter",
                run() {
                  props.run();
                  return true;
                },
              },
            ]),
            keymap.of(defaultKeymap),
            EditorView.updateListener.of((v) => {
              if (v.docChanged) {
                const docstring = v.state.doc.toString();
                props.setCode(docstring);
              }
            }),
            diceRollerSyntaxHighlighterPlugin(),
            diceRollerDiagnosticPlugin(),
          ];

          const state = EditorState.create({
            doc: props.code(),
            extensions: extensions(),
          });

          createEffect(() => {
            untrack(() => {
              view.setState(
                EditorState.create({
                  doc: props.code(),
                  extensions: extensions(),
                })
              );
            });
          });

          const view = new EditorView({
            state,
            parent: el,
          });
        }}
      ></div>
      <button
        class="run-button"
        onclick={() => {
          props.run();
        }}
      >
        Roll
      </button>
    </div>
  );
}
