const path = require("path");
const fs = require("fs");

/**
 * @param {string} filePath Path of the file that extends the base class
 * @param {string} importExpr The expression used to import the base class
 * @returns {string} An absolute path to the imported file
 */
/**
 * TODO: Everytime resolve is being called, it has to open the tsconfig file. We should
 * store the definition of that file into the memory, so future access are faster.
 */
export const resolve = (
  filePath: string,
  importExpr: string
): string | null => {
  /**
   * @param {string} importExpr The expression used to import the class in the file
   * @returns {string} The the path in the import expression
   */
  const extractPathFromImportExpr = (importExpr: string): string => {
    let path = importExpr.substr(importExpr.indexOf('"') + 1);
    return path.replace(/\"/g, "");
  };

  let resolvedPath = "",
    pathToFile = extractPathFromImportExpr(importExpr);

  if (pathToFile.startsWith("@")) {
    const rootProjectDir = process.env.ROOT_PROJECT_PATH;

    const tsconfigFile: any = JSON.parse(
      fs.readFileSync(path.resolve(`${rootProjectDir}/tsconfig.json`), {
        encoding: "utf8",
        flag: "r",
      })
    );

    let compilerOptionsPathsKey = pathToFile.substr(0, pathToFile.indexOf("/")),
      compilerOptionsPathsValue = "";
    if (compilerOptionsPathsKey + "/*" in tsconfigFile.compilerOptions.paths) {
      compilerOptionsPathsValue =
        tsconfigFile.compilerOptions.paths[compilerOptionsPathsKey + "/*"];
    } // TODO: else throw an exception

    const aux = path.join(
      path.posix.resolve(),
      pathToFile
        .replace(compilerOptionsPathsKey, compilerOptionsPathsValue)
        .replace(/(\s+)/g, " ")
        .replace(/"/g, "") + ".ts"
    );

    // Notice that by calling path.join with a relative path of the base
    // path from ComponentClassPath and the full path of the file resolves into the
    // full path of the base path
    resolvedPath = path.join(
      path.posix.resolve(),
      pathToFile
        .replace(compilerOptionsPathsKey, compilerOptionsPathsValue)
        .replace(/(\s+)/g, " ")
        .replace(/"/g, "") + ".ts"
    );
  } else {
    resolvedPath = path.join(
      path.dirname(filePath),
      pathToFile.replace(/(\s+)/g, " ").replace(/"/g, "") + ".ts"
    );
  }

  // TODO: Throw an error if the function is unable to resolve the path
  return resolvedPath;
};

export default {
  resolve,
};
