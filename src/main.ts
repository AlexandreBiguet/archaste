import { existsSync, readFileSync } from "fs";
import ts, { ImportDeclaration } from "typescript";
import { printTree } from "./tree_visualizer";
import { ASTVisitor } from "./visitor";
import { LogVisitor } from "./log_visitor";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

let dependencies = new Map<string, boolean>();

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

class ImportGraph {
  implementation: AdjacencyList = new AdjacencyList();

  add_edge(import1: Import, import2: Import): void {
    this.implementation.add_edge(import1, import2);
  }

  toJSON(): JsonNode {
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

let importGraph: ImportGraph = new ImportGraph();

function traverseAST(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  visitors: Array<ASTVisitor>,
  depth: number = 1
) {
  if (ts.isImportDeclaration(node)) {
    // Note - for now this only takes into account imports that can be resolved
    //  (basically files from the same repo)

    const options: ts.CompilerOptions = {
      module: ts.ModuleKind.Node16, // Needs that to be able to resolve imports with index.ts files
      target: ts.ScriptTarget.ES5,
    };

    const fileContent = readFileSync(sourceFile.fileName).toString();
    const fileInfo = ts.preProcessFile(fileContent);

    fileInfo.importedFiles
      .map((importedModule) => importedModule.fileName)
      .forEach((rawImport) => {
        const resolvedImport = ts.resolveModuleName(
          rawImport,
          sourceFile.fileName,
          options,
          ts.sys
        );

        if (resolvedImport.resolvedModule !== undefined) {
          const importLoc = resolvedImport.resolvedModule?.resolvedFileName;
          if (importLoc !== undefined) {
            if (!dependencies.has(importLoc)) {
              dependencies.set(importLoc, false);
              console.log(
                `File ${sourceFile.fileName} imports ${rawImport} from location ${importLoc}`
              );
              const moduleSourceFile = createSourceFile(importLoc);

              const f1 = sourceFile.fileName;
              const f2 = moduleSourceFile.fileName;
              importGraph.add_edge(f1, f2);

              traverseAST(moduleSourceFile, moduleSourceFile, visitors);
            }
          }
        }
      });
  }

  dependencies.set(sourceFile.fileName, true);

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

function createSourceFile(fileName: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    true
  );
}

function main() {
  const args = process.argv.slice(2);

  const options = args.filter((elem) => elem.startsWith("--"));
  const fileNames = args.filter((elem) => existsSync(elem));

  fileNames.forEach((fileName) => {
    const sourceFile = createSourceFile(fileName);

    if (options.some((elem) => elem == "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      // const visitors = [new LogVisitor()];
      const visitors: Array<LogVisitor> = [];
      traverseAST(sourceFile, sourceFile, visitors);
    }
  });

  console.log(JSON.stringify(importGraph.toJSON()));
}

main();
