import { PositionedNode } from "./parser.jsx";

export function cloneAST<T extends PositionedNode>(ast: T): T {
  switch (ast.type) {
    case "Number":
    case "Error":
      return {
        ...ast,
      };
    case "BinaryOp":
      return {
        ...ast,
        left: cloneAST(ast.left),
        right: cloneAST(ast.right),
      };
    case "FunctionCall":
      return {
        ...ast,
        arguments: ast.arguments.map(cloneAST),
      };
    case "DamageType":
      return {
        ...ast,
        operand: cloneAST(ast.operand),
      };
    case "TernaryNode":
      return {
        ...ast,
        condition: cloneAST(ast.condition),
        ifTrue: cloneAST(ast.ifTrue),
        ifFalse: ast.ifFalse ? cloneAST(ast.ifFalse) : undefined,
      };
  }
}
