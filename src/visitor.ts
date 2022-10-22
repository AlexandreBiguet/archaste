import ts from "typescript";

export interface ASTVisitor {
  onArrowFunc(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onFuncDecl(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onCallExp(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
}
