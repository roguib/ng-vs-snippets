import { Dirent } from "fs";
import logger from "./shared/logger";

const fs = require("fs");
const path = require("path");

// TODO: Parse files synchronously
export const walker = (root: string, filesExploredPath: Array<string>): Array<string> => {
  let pendingDir: Array<string> = [root];

  while (pendingDir.length > 0) {
    let currentDir = pendingDir.shift();

    if (currentDir == null) break;

    const files: Dirent[] = fs.readdirSync(currentDir, {
      encoding: "utf8",
      withFileTypes: true,
    });

    for (let file of files) {
      if (file.isFile() && file.name.endsWith(".ts")) {
        logger.log("Candidate file to contain component definition:", file.name);
        filesExploredPath.push(path.join(currentDir, file.name));
      } else if (file.isDirectory() && file.name != "node_modules" && file.name != ".git") {
        pendingDir.push(path.join(currentDir, file.name));
      }
    }
  }
  return filesExploredPath;
};
