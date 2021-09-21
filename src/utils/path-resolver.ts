const path = require("path");
const fs = require("fs");

let tsconfigFile: {
  compilerOptions: {
    paths: any;
  };
} | null = null;

/**
 * @param {string} filePath Path of the file that extends the base class
 * @param {string} importExpr The expression used to import the base class
 * @returns {string} An absolute path to the imported file
 */
export const resolve = (filePath: string, importExpr: string): string | null => {
  /**
   * @param {string} importExpr The expression used to import the class in the file
   * @returns {string} The the path in the import expression
   */
  const extractPathFromImportExpr = (importExpr: string): string => {
    let pathIndex = importExpr.indexOf('"');

    if (pathIndex === -1) {
      pathIndex = importExpr.indexOf("'");
    }
    let path = importExpr.substr(pathIndex + 1);
    return path.replace(/\"/g, "").replace(/'/g, "");
  };

  let resolvedPath = "",
    pathToFile = extractPathFromImportExpr(importExpr);

  if (pathToFile.startsWith("@")) {
    const rootProjectDir = process.env.ROOT_PROJECT_PATH;

    if (tsconfigFile == null) {
      tsconfigFile = JSON.parse(
        fs.readFileSync(path.resolve(`${rootProjectDir}/tsconfig.json`), {
          encoding: "utf8",
          flag: "r",
        })
      );
    }

    let compilerOptionsPathsKey = pathToFile.substr(0, pathToFile.indexOf("/")),
      compilerOptionsPathsValue: Array<string> = [""];
    if (compilerOptionsPathsKey + "/*" in tsconfigFile?.compilerOptions.paths) {
      compilerOptionsPathsValue = tsconfigFile?.compilerOptions.paths[compilerOptionsPathsKey + "/*"];
    } // TODO: else throw an exception

    compilerOptionsPathsValue[0] = compilerOptionsPathsValue[0].replace("/*", "");

    // Notice that by calling path.join with a relative path of the base
    // path from ComponentClassPath and the full path of the file resolves into the
    // full path of the base path
    resolvedPath = path.join(
      path.posix.resolve(),
      pathToFile.replace(compilerOptionsPathsKey, compilerOptionsPathsValue[0]).replace(/(\s+)/g, " ").replace(/"/g, "") + ".ts"
    );
  } else {
    resolvedPath = path.join(path.dirname(filePath), pathToFile.replace(/(\s+)/g, " ").replace(/"/g, "") + ".ts");
  }

  // TODO: Throw an error if the function is unable to resolve the path
  return resolvedPath;
};

export default {
  resolve,
};
