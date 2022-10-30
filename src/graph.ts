// How can I use a custom type for as key in a map ?
type Vertex = string;

interface GraphImplementation {
  add_edge(node1: Vertex, node2: Vertex): void;
}

class AdjacencyList implements GraphImplementation {
  add_edge(node1: Vertex, node2: Vertex): void {
    if (this.adjacencyList.has(node1)) {
      this.adjacencyList.get(node1)?.push(node2);
    } else {
      this.adjacencyList.set(node1, [node2]);
    }

    if (!this.adjacencyList.has(node2)) {
      // Just to make sure we can find the name of leaf nodes
      this.adjacencyList.set(node2, []);
    }
  }

  adjacencyList: Map<Vertex, Array<Vertex>> = new Map<Vertex, Array<Vertex>>();
}

type Import = Vertex; // WTF

// class Import implements Vertex {
//   name: string;
//   constructor(name: string) {
//     this.name = name;
//   }
// }

class JsonNode {
  name: string;
  parent: string | null;
  children: Array<JsonNode>;

  constructor(name: string, parent: string | null, children: Array<JsonNode>) {
    this.name = name;
    this.parent = parent;
    this.children = children;
  }
}

export class ImportGraph {
  implementation: AdjacencyList = new AdjacencyList();

  add_edge(import1: Import, import2: Import): void {
    this.implementation.add_edge(import1, import2);
  }

  toJSON(): JsonNode {
    // how to make this function private ?
    const size = this.implementation.adjacencyList.size;
    const keys = Array.from(this.implementation.adjacencyList.keys());

    let treeBuilder = (keyIndex: number, parent: string | null) => {
      const name = keys[keyIndex];
      const childrenString = this.implementation.adjacencyList.get(name);
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
}
