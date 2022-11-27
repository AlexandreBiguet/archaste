import ts from "typescript";
import { createWriteStream, readFileSync } from "fs";
import { ASTVisitorInterface } from "./visitors";
import { graphToJSON, graphToMarkMap, graphToMermaid } from "./frontends";

let dependencies = new Set<string>();

export function traverseAST(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  visitors: Array<ASTVisitorInterface>,
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
              dependencies.add(importLoc);
              const moduleSourceFile = createSourceFile(importLoc);
              traverseAST(moduleSourceFile, moduleSourceFile, visitors);
            }
          }
        }
      });

    visitors.forEach((vis) => vis.onImportStatement(sourceFile, node, depth));
  }

  dependencies.add(sourceFile.fileName);

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

export function createSourceFile(fileName: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    true
  );
}
