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
  if (indentLevel != 0) {
    console.log(
      getFormattedText(
        sourceFile,
        node,
        indentLevel,
        withText,
        withLine,
        separator
      )
    );
  }

  node.forEachChild((child) => printTree(sourceFile, child, indentLevel + 1));
}

function getFormattedText(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  indentLevel: number,
  withText: boolean,
  withLine: boolean,
  separator: string
) {
  const indentation = separator.repeat(indentLevel);
  const syntaxKind = ts.SyntaxKind[node.kind];

  let msg = withLine ? locationInFile(sourceFile, node) : "";
  msg += `${indentation} ${syntaxKind}`;
  if (withText) {
    const nodeText = node.getText(sourceFile);
    msg += `: ${nodeText}`;
  }
  return msg;
}

function locationInFile(sourceFile: ts.SourceFile, node: ts.Node): string {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart()
  );
  return (
    `${sourceFile.fileName}:` + `${line + 1}:${character + 1}`.padEnd(6) + "-"
  );
}

function getNextIdentifier(node: ts.Node): ts.Node | undefined {
  const predicate = (node: ts.Node): boolean => {
    if (ts.isIdentifier(node)) {
      return true;
    }
    return false;
  };
  const children = node.getChildren();
  return children.find(predicate);
}

function analyzeFunctions(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  indentLevel: number = 1,
  separator: string = "--------"
) {
  const indentation = separator.repeat(indentLevel);
  let funcName: undefined | string = undefined; // is this the way to define Option<string> ?

  if (ts.isArrowFunction(node)) {
    funcName = node.parent.getChildAt(0).getText();
    indentLevel += 1;
  }

  if (ts.isFunctionDeclaration(node)) {
    funcName = getNextIdentifier(node)?.getText();
    indentLevel += 1;
  }

  if (funcName !== undefined) {
    console.log(
      reportFunc(locationInFile(sourceFile, node), indentation, funcName)
    );
  }

  if (ts.isCallExpression(node)) {
    console.log(
      reportFunc(locationInFile(sourceFile, node), indentation, node.getText())
    );
  }

  node.forEachChild((child) =>
    analyzeFunctions(sourceFile, child, indentLevel)
  );
}

function reportFunc(filename: string, separator: string, text: string): string {
  return filename.padEnd(30) + separator + "  " + text;
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

    if (options.some((elem) => elem == "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      analyzeFunctions(sourceFile, sourceFile);
    }
  });
}

main();
