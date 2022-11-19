import ts from "typescript";

// TODO move to frontends

export function printTree(
  sourceFile: ts.SourceFile,
  node: ts.Node,

  indentLevel: number = 0,
  withText: boolean = false,
  withLine: boolean = true,
  separator: string = "  "
) {
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

export function locationInFile(
  sourceFile: ts.SourceFile,
  node: ts.Node
): string {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart()
  );
  return (
    `${sourceFile.fileName}:` + `${line + 1}:${character + 1}`.padEnd(6) + "-"
  );
}
