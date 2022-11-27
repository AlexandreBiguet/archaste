import ts from "typescript";
import { ASTVisitorInterface } from "../visitors";
import { locationInFile } from "../frontends";

export class LogVisitor implements ASTVisitorInterface {
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
