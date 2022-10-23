import { existsSync, readFileSync } from "fs";
import ts, { ImportDeclaration } from "typescript";
import { printTree } from "./tree_visualizer";
import { ASTVisitor } from "./visitor";
import { LogVisitor } from "./log_visitor";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
// https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/

function traverseAST(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  visitors: Array<ASTVisitor>,
  depth: number = 1
) {
  if (ts.isImportDeclaration(node)) {
    const decl = node as ImportDeclaration;
    console.log(node.moduleSpecifier.getText());
    const options: ts.CompilerOptions = {
      module: ts.ModuleKind.AMD,
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
            console.log(
              `File ${sourceFile.fileName} imports ${rawImport} from location ${importLoc}`
            );
          }
        }
      });
  }

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
      const visitors = [new LogVisitor()];
      traverseAST(sourceFile, sourceFile, visitors);
    }
  });
}

main();
