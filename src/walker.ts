import { Dirent } from "fs";
import * as logger from "./shared/logger";

const fs = require("fs");
const path = require("path");

// TODO: Parse files synchronously
export const walker = (
  root: string,
  filesExploredPath: Array<string>
): Array<string> => {
  const files: Dirent[] = fs.readdirSync(root, {
    encoding: "utf8",
    withFileTypes: true,
  });
  for (let file of files) {
    if (file.isFile() && file.name.endsWith(".ts")) {
      logger.log("Candidate file to contain component definition:", file.name);
      filesExploredPath.push(path.join(root, file.name));
    } else if (
      file.isDirectory() &&
      file.name != "node_modules" &&
      file.name != ".git"
    ) {
      // TODO: We should be able to specify which folders do we ignore
      filesExploredPath.push(...walker(path.join(root, file.name), filesExploredPath));
    }
  }
  return filesExploredPath;
};
