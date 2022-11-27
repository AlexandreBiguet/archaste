import { existsSync } from "fs";
import { createWriteStream } from "fs";
import { graphToJSON, graphToMarkMap, graphToMermaid } from "./frontends";
import {
  ASTVisitorInterface,
  createASTVisitor,
  createLogVisitor,
} from "./visitors";

import { createSourceFile, traverseAST } from "./traverse_ast";
import { Graph } from "./graph";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

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

    let visitors: Array<ASTVisitorInterface> = [];
    if (options.some((elem) => elem === "--log-visitor")) {
      visitors.push(createLogVisitor());
    }

    let graph = new Graph();
    visitors.push(createASTVisitor(graph));

    traverseAST(sourceFile, sourceFile, visitors);

    if (options.some((elem) => elem === "--importJson")) {
      console.log(JSON.stringify(graphToJSON(graph.implementation), null, 2));
    } else if (options.some((elem) => elem === "--markmap")) {
      graphToMarkMap(graph.implementation, createStreamOrStdout());
    } else if (options.some((elem) => elem === "--mermaid")) {
      graphToMermaid(graph.implementation, createStreamOrStdout());
    }
  });
}

function createStreamOrStdout(
  filename: string | undefined = undefined
): NodeJS.WritableStream {
  let stream = createWriteStream("", { fd: process.stdout.fd });

  if (filename !== undefined) {
    stream = createWriteStream(filename);
  }

  return stream;
}

main();
