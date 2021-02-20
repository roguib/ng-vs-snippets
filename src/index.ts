const fs = require("fs");
const path = require("path");
const readline = require("readline");
const argv = process.argv;
import * as walker from "./walker";
import * as parser from "./parser";
import * as generator from "./generator";
import { File } from "./shared/IFile";

// TODO: Use a config interface
let workingDir = "";

const parseArgs = (args: string[]) => {
  // TODO: Include multiple options
  while (args.length > 0) {
    console.log(args);
    const arg = args.shift();

    if (arg == null) break;

    if (arg == "--dir") {
      const absPath = args.shift();

      if (absPath == null) break;

      workingDir = path.join(absPath, "/src");
    }
  }
};

export const run = async (args: string[]) => {
  parseArgs(args);
  // const config = parseArgs(args);
  let candidateFilePaths: Array<string> = walker.walker(
    workingDir || path.join(path.posix.resolve(), "src/"),
    []
  );
  let fileData: Array<File> = parser.parser(candidateFilePaths);
  generator.generator(
    fileData,
    path.join(workingDir, "/.vscode")
  );
};

console.log(argv);
run(argv.slice(2, argv.length));
