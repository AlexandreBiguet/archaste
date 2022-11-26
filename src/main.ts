import { existsSync } from "fs";

import { printTree } from "./frontends";
import { LogVisitor } from "./visitors";

import {
  createSourceFile,
  traverseAST,
  getImportTreeAsJSONString,
  writeImportTreeAsMarkMapFile,
  writeImportTreeAsMermaidFile,
} from "./traverse_ast";

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

    if (options.some((elem) => elem === "--tree")) {
      printTree(sourceFile, sourceFile);
    } else {
      let visitors: Array<LogVisitor> = [];
      if (options.some((elem) => elem === "--log-visitor")) {
        visitors = [new LogVisitor()];
      }
      traverseAST(sourceFile, sourceFile, visitors);

      if (options.some((elem) => elem === "--importJson")) {
        console.log(getImportTreeAsJSONString());
      } else if (options.some((elem) => elem === "--markmap")) {
        writeImportTreeAsMarkMapFile();
      } else if (options.some((elem) => elem === "--mermaid")) {
        writeImportTreeAsMermaidFile();
      }
    }
  });
}

main();
