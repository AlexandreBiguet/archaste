import ts from "typescript";

import { AdjacencyList } from "./graph";

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
  let visited = new Set<string>();

  let treeBuilder = (keyIndex: number, parent: string | null) => {
    const name = keys[keyIndex];
    visited.add(name);
    const childrenString = graph.adjacencyList.get(name);

    let children = new Array<JsonNode>();

    if (childrenString !== undefined) {
      children = childrenString.map((elem) => {
        if (!visited.has(elem)) {
          const indexOfElem = keys.indexOf(elem);
          return treeBuilder(indexOfElem, name);
        }
        return { name: name, parent: parent, children: [] };
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
  let visited = new Set<string>();

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
    visited.add(name);

    const children = graph.adjacencyList.get(name);

    children?.map((elem) => {
      if (!visited.has(elem)) {
        const index = keys.indexOf(elem);
        treeBuilder(depth + 1, index);
      }
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

export function graphToMermaid(
  graph: AdjacencyList,
  stream: NodeJS.WritableStream
) {
  const separator = "\t";
  const endLine = "\n";
  const edge = " --> ";
  const direction = "TD";

  stream.write("```mermaid" + endLine);
  stream.write("graph " + direction + endLine);

  for (let [key, imports] of graph.adjacencyList) {
    imports.forEach((importItem) =>
      stream.write(separator + key + edge + importItem + endLine)
    );
  }

  stream.write("```" + endLine);
}
