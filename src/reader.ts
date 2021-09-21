import { Dirent } from "fs";
import { FileType } from "./shared/constants";
import logger from "./shared/logger";

const fs = require("fs");
const path = require("path");

export const reader = (root: string): Array<{ type: FileType; filePath: string; fileData: string }> => {
  let pendingDir: Array<string> = [root],
    result: Array<{ type: FileType; filePath: string; fileData: string }> = [];

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
        const filePath = path.join(currentDir, file.name);
        const fileData: string = fs.readFileSync(filePath, {
          encoding: "utf8",
          flag: "r",
        });

        let type: FileType = "CLASS";
        if (fileData?.match(/@Component/g)?.length || 0 > 0) {
          type = "COMPONENT";
        }

        // In the future we will add FileType PIPE & FileType DIRECTIVE

        result.push({
          type,
          filePath,
          fileData,
        });
      } else if (file.isDirectory() && file.name != "node_modules" && file.name != ".git") {
        pendingDir.push(path.join(currentDir, file.name));
      }
    }
  }
  return result;
};
