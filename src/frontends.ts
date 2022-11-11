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
  const size = graph.adjacencyList.size;
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
