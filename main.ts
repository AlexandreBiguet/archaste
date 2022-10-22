import { existsSync, readFileSync } from "fs";
import * as ts from "typescript";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

function printTree(
  sourceFile: ts.SourceFile,
  node: ts.Node,

  indentLevel: number = 0,
  withText: boolean = false,
  withLine: boolean = true,
  separator: string = "  "
) {
  const indentation = separator.repeat(indentLevel);
  const syntaxKind = ts.SyntaxKind[node.kind];

  if (indentLevel != 0) {
    let msg = withLine ? locationInFile(sourceFile, node) : "";
    msg += `${indentation} ${syntaxKind}`;
    if (withText) {
      const nodeText = node.getText(sourceFile);
      msg += `: ${nodeText}`;
    }
    console.log(msg);
  }

  node.forEachChild((child) => printTree(sourceFile, child, indentLevel + 1));
}

function locationInFile(sourceFile: ts.SourceFile, node: ts.Node): string {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart()
  );
  return `${sourceFile.fileName}:${line + 1}:${character + 1} - `;
}

function analyzeFunctions(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  isInFunctionContext: boolean = false,
  indentLevel: number = 1,
  separator: string = "--------"
) {
  const indentation = separator.repeat(indentLevel);
  let inFunction = isInFunctionContext;
  if (ts.isArrowFunction(node)) {
    const funcIdentifier = node.parent.getChildAt(0).getText();
    console.log(indentation + "  " + `${funcIdentifier}`);
    inFunction = true;
    indentLevel += 1;
  }

  if (ts.isFunctionDeclaration(node)) {
    const funcNode = node as ts.FunctionDeclaration;
    console.log(indentation + "  " + `${funcNode.name?.getText()}`);
    inFunction = true;
    indentLevel += 1;
  }

  if (inFunction) {
    if (ts.isCallExpression(node)) {
      console.log(
        indentation +
          "  " +
          `${node.getText()}` +
          "\t" +
          locationInFile(sourceFile, node)
      );
    }
  }

  node.forEachChild((child) =>
    analyzeFunctions(sourceFile, child, inFunction, indentLevel)
  );
}

function main() {
  const args = process.argv.slice(2);

  const options = args.filter((elem) => elem.startsWith("--"));
  const fileNames = args.filter((elem) => existsSync(elem));

  fileNames.forEach((fileName) => {
    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName).toString(),
      ts.ScriptTarget.ES2022, // No idea what that means
      true
    );

    console.log(`${sourceFile.fileName}`);

    if (options.some((elem) => elem == "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      analyzeFunctions(sourceFile, sourceFile);
    }
  });
}

main();
