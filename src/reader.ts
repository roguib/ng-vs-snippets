import { Dirent } from "fs";
import { FileType } from "./shared/constants";
import { IFileData } from "./shared/IFileData";
import logger from "./shared/logger";

const fs = require("fs");
const path = require("path");

/**
 *
 * @param {string} root The root of the directory in which the function has
 * to start reading files
 * @returns {Array<IFileData>} An array that contains all the files that are candidates of having
 * components or class definitions
 */
export const reader = (root: string): Array<IFileData> => {
  let pendingDir: Array<string> = [root],
    result: Array<IFileData> = [];

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
        const componentMatch: RegExpMatchArray | null = fileData?.match(/@Component/g);
        if (componentMatch && componentMatch.length > 0) {
          type = "COMPONENT";
        } else {
          const pipeMatch: RegExpMatchArray | null = fileData?.match(/@Pipe/g);
          if (pipeMatch && pipeMatch.length > 0) {
            type = "PIPE";
          }
        }
        // In the future we will add FileType DIRECTIVE

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
