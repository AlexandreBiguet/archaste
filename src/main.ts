import { existsSync } from "fs";

import { printTree } from "./frontends";

import { LogVisitor } from "./log_visitor";
import {
  createSourceFile,
  traverseAST,
  getImportTreeAsJSONString,
  writeImportTreeAsMarkMapFile,
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
      // const visitors = [new LogVisitor()];
      const visitors: Array<LogVisitor> = [];
      traverseAST(sourceFile, sourceFile, visitors);

      if (options.some((elem) => elem === "--importJson")) {
        console.log(getImportTreeAsJSONString());
      } else if (options.some((elem) => elem === "--markmap")) {
        writeImportTreeAsMarkMapFile();
      }
    }
  });
}

main();
