import ts from "typescript";
import { Graph } from "./graph";

export interface ASTVisitor {
  onArrowFunc(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onFuncDecl(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onCallExp(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void;
  onImportStatement(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    depth: number
  ): void;
}

import { locationInFile } from "./frontends";
import path from "path";

export class LogVisitor implements ASTVisitor {
  separator: string = "-";
  padding: number = 30;

  onArrowFunc(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    // should use ts.findAncestor
    const funcName = node.parent.getChildAt(0).getText();
    this.onNewFunc(sourceFile, node, funcName, depth);
  }

  onFuncDecl(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    const funcName = this.getNextIdentifier(node)?.getText() ?? "undefined";
    this.onNewFunc(sourceFile, node, funcName, depth);
  }

  onNewFunc(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    funcName: string,
    depth: number
  ): void {
    console.log(this.prefix(sourceFile, node, depth) + funcName);
  }

  onCallExp(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    console.log(this.prefix(sourceFile, node, depth) + node.getText());
  }

  onImportStatement(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    depth: number
  ): void {
    const currentSrcFile = sourceFile.fileName;
    console.log(this.prefix(sourceFile, node, depth) + node.getText());
  }

  prefix(sourceFile: ts.SourceFile, node: ts.Node, depth: number): string {
    return (
      locationInFile(sourceFile, node).padEnd(this.padding) +
      this.indentation(depth) +
      "  "
    );
  }

  indentation(depth: number): string {
    return this.separator.repeat(depth * 5);
  }

  getNextIdentifier(node: ts.Node): ts.Node | undefined {
    const predicate = (node: ts.Node): boolean => {
      if (ts.isIdentifier(node)) {
        return true;
      }
      return false;
    };
    const children = node.getChildren();
    return children.find(predicate);
  }
}

export class Visitor implements ASTVisitor {
  importGraph: Graph;

  constructor(graph: Graph) {
    this.importGraph = graph;
  }

  onArrowFunc(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    // TODO
  }

  onFuncDecl(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    // TODO
  }

  onCallExp(sourceFile: ts.SourceFile, node: ts.Node, depth: number): void {
    // TODO
  }

  onImportStatement(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    _depth: number
  ): void {
    let imported = this.getImportedFile(node);
    if (imported === undefined) {
      return;
    }
    this.importGraph.add_edge(
      sourceFile.fileName,
      this.constructImportedFile(sourceFile.fileName, imported.getText())
    );
  }

  constructImportedFile(sourceFile: string, importedFile: string): string {
    const sourceDir = path.dirname(sourceFile);
    const extension = path.extname(sourceFile);
    const importedFileFull = path.join(
      sourceDir,
      this.trimImportString(importedFile)
    );
    return importedFileFull + extension;
  }

  trimImportString(imported: string): string {
    // At this point, assuming the analyzed code compiles, then first and last chars are
    // either a " or a '
    return imported.slice(1, -1);
  }

  getImportedFile(node: ts.Node): ts.Node | undefined {
    const predicate = (node: ts.Node): boolean => {
      if (ts.isStringLiteral(node)) {
        return true;
      }
      return false;
    };
    const children = node.getChildren();
    return children.find(predicate);
  }
}
