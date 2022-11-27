import { existsSync } from "fs";

import {
  printTree,
  graphToJSON,
  graphToMarkMap,
  graphToMermaid,
} from "./frontends";
import { ASTVisitor, LogVisitor, Visitor } from "./visitors";

import {
  createSourceFile,
  traverseAST,
  getImportTreeAsJSONString,
  writeImportTreeAsMarkMapFile,
  writeImportTreeAsMermaidFile,
  printGraphImplementation,
  createStreamOrStdout,
} from "./traverse_ast";
import { Graph } from "./graph";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

const USE_VISITOR: boolean = true;

function main() {
  const args = process.argv.slice(2);

  const options = args.filter((elem) => elem.startsWith("--"));
  const fileNames = args.filter((elem) => existsSync(elem));

  if (fileNames.length === 0) {
    console.log("No files provided - nothing to do");
    return;
  }

  fileNames.forEach((fileName) => {
    const sourceFile = createSourceFile(fileName);

    if (options.some((elem) => elem === "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      let visitors: Array<ASTVisitor> = [];
      if (options.some((elem) => elem === "--log-visitor")) {
        visitors.push(new LogVisitor());
      }

      let graph = new Graph();
      visitors.push(new Visitor(graph));

      traverseAST(sourceFile, sourceFile, visitors);

      if (USE_VISITOR) {
        if (options.some((elem) => elem === "--importJson")) {
          console.log(
            JSON.stringify(graphToJSON(graph.implementation), null, 2)
          );
        } else if (options.some((elem) => elem === "--markmap")) {
          graphToMarkMap(graph.implementation, createStreamOrStdout());
        } else if (options.some((elem) => elem === "--mermaid")) {
          graphToMermaid(graph.implementation, createStreamOrStdout());
        }
      } else {
        if (options.some((elem) => elem === "--importJson")) {
          console.log(getImportTreeAsJSONString());
        } else if (options.some((elem) => elem === "--markmap")) {
          writeImportTreeAsMarkMapFile();
        } else if (options.some((elem) => elem === "--mermaid")) {
          writeImportTreeAsMermaidFile();
        }
      }
    }
  });
}

main();
