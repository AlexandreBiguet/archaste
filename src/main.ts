import { existsSync, readFileSync } from "fs";
import ts from "typescript";
import { printTree } from "./tree_visualizer";
import { ASTVisitor } from "./visitor";
import { LogVisitor } from "./log_visitor";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

function traverseAST(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  visitors: Array<ASTVisitor>,
  depth: number = 1
) {
  if (ts.isArrowFunction(node)) {
    visitors.forEach((vis) => vis.onArrowFunc(sourceFile, node, depth));
    depth++;
  }

  if (ts.isFunctionDeclaration(node)) {
    visitors.forEach((vis) => vis.onFuncDecl(sourceFile, node, depth));
    depth++;
  }

  if (ts.isCallExpression(node)) {
    visitors.forEach((vis) => vis.onCallExp(sourceFile, node, depth));
  }

  node.forEachChild((child) => traverseAST(sourceFile, child, visitors, depth));
}

function main() {
  const args = process.argv.slice(2);

  const options = args.filter((elem) => elem.startsWith("--"));
  const fileNames = args.filter((elem) => existsSync(elem));

  fileNames.forEach((fileName) => {
    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName).toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    if (options.some((elem) => elem == "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      const visitors = [new LogVisitor()];
      traverseAST(sourceFile, sourceFile, visitors);
    }
  });
}

main();
