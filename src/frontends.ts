import ts from "typescript";

import { AdjacencyList } from "./graph";

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

export class JsonNode {
  name: string;
  parent: string | null;
  children: Array<JsonNode>;

  constructor(name: string, parent: string | null, children: Array<JsonNode>) {
    this.name = name;
    this.parent = parent;
    this.children = children;
  }
}

export function graphToJSON(graph: AdjacencyList): JsonNode {
  const size = graph.adjacencyList.size; // TODO unused
  const keys = Array.from(graph.adjacencyList.keys());

  let treeBuilder = (keyIndex: number, parent: string | null) => {
    const name = keys[keyIndex];
    const childrenString = graph.adjacencyList.get(name);
    let children = new Array<JsonNode>();

    if (childrenString !== undefined) {
      children = childrenString.map((elem) => {
        const indexOfElem = keys.indexOf(elem);
        return treeBuilder(indexOfElem, name);
      });
    }

    let node: JsonNode = {
      name: name,
      parent: parent,
      children: children,
    };

    return node;
  };

  let rootNode: JsonNode = treeBuilder(0, null);

  return rootNode;
}

export function graphToMarkMap(
  graph: AdjacencyList,
  stream: NodeJS.WritableStream
) {
  const separator = "  ";
  const firstLevelAnchor = "#";
  const otherAnchor = "-";
  const endLine = "\n";
  const space = " ";

  const keys = Array.from(graph.adjacencyList.keys());

  let treeBuilder = (depth: number, keyIndex: number) => {
    if (depth === 0) {
      stream.write(firstLevelAnchor);
    } else {
      stream.write(separator.repeat(depth - 1));
      stream.write(otherAnchor);
    }
    const name = keys[keyIndex];
    stream.write(space + name + endLine);

    if (depth === 0) {
      stream.write(endLine);
    }

    const children = graph.adjacencyList.get(name);

    children?.map((elem) => {
      const index = keys.indexOf(elem);
      treeBuilder(depth + 1, index);
    });
  };

  writeMarkmapHeader(stream);
  treeBuilder(0, 0);
}

function writeMarkmapHeader(stream: NodeJS.WritableStream) {
  stream.write(
    `---
markmap:
  colorFreezeLevel: 2
  maxWidth: 150
--- \n\n`
  );
}
