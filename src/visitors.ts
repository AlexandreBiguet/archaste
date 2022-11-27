import ts from "typescript";
import { Graph } from "./graph";
import { ASTVisitor } from "./visitors/ast_visitor";
import { LogVisitor } from "./visitors/log_visitor";

export interface ASTVisitorInterface {
  onArrowFunc(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onFuncDecl(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onCallExp(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onImportStatement(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    depth: number
  ): void;
}

export function createLogVisitor(): ASTVisitorInterface {
  return new LogVisitor();
}

export function createASTVisitor(graph: Graph): ASTVisitorInterface {
  return new ASTVisitor(graph);
}
