import { Dirent } from "fs";

const fs = require("fs");
const path = require("path");

// TODO: move it to another file
export const walker = (
  root: string,
  filesExploredPath: Array<string>
): Array<string> => {
  // console.log(`Start exploring ${root}`);
  const files: Dirent[] = fs.readdirSync(root, {
    encoding: "utf8",
    withFileTypes: true,
  });
  // console.log(files);
  for (let file of files) {
    if (file.isFile() && file.name.endsWith(".ts")) {
      filesExploredPath = [...filesExploredPath, path.join(root, file.name)];
    } else if (
      file.isDirectory() &&
      file.name != "node_modules" &&
      file.name != ".git"
    ) {
      // TODO: We should be able to specify which folders do we ignore
      filesExploredPath = [
        ...filesExploredPath,
        ...walker(path.join(root, file.name), filesExploredPath),
      ] as string[];
    }
  }
  return filesExploredPath;
};

console.log(walker(path.posix.resolve(), []));
