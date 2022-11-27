// How can I use a custom type for as key in a map ?
type Vertex = string;

export interface GraphImplementation {
  add_edge(node1: Vertex, node2: Vertex): void;
}

export class AdjacencyList implements GraphImplementation {
  add_edge(node1: Vertex, node2: Vertex): void {
    if (this.adjacencyList.has(node1)) {
      this.adjacencyList.get(node1)?.push(node2);
    } else {
      this.adjacencyList.set(node1, [node2]);
    }

    // TODO: this is a hack - should be handled downstream
    this.add_leaf_node_name_for_lookup(node2);
  }

  add_leaf_node_name_for_lookup(node: Vertex): void {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
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

export class Graph {
  implementation: AdjacencyList = new AdjacencyList();

  add_edge(import1: Import, import2: Import): void {
    this.implementation.add_edge(import1, import2);
  }
}
