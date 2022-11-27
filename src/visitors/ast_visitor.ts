import ts from "typescript";
import path from "path";

import { Graph } from "../graph";
import { ASTVisitorInterface } from "../visitors";

export class ASTVisitor implements ASTVisitorInterface {
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
