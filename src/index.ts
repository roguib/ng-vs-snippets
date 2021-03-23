const fs = require("fs");
const path = require("path");
const readline = require("readline");
const argv = process.argv;
import * as walker from "./walker";
import * as parser from "./parser";
import * as generator from "./generator";
import { File } from "./shared/IFile";
import logger from "./shared/logger";

// TODO: Use a config interface
let workingDir = "";
let outputDir = "";
let debug = false;

const parseArgs = (args: string[]) => {
  // TODO: Include multiple options
  while (args.length > 0) {
    const arg = args.shift();

    if (arg == null) break;

    if (arg == "--dir") {
      const absPath = args.shift();

      if (absPath == null) break;

      workingDir = absPath;
    }

    if (arg == "--output") {
      const outputPath = args.shift();

      if (outputPath == null) break;

      outputDir = outputPath;
    }

    if (arg == "--debug") {
      debug = true;
    }
  }
};

export const run = async (args: string[]) => {
  parseArgs(args);
  // const config = parseArgs(args);

  if (debug) {
    logger.enableDebugger();
  }
  let candidateFilePaths: Array<string> = walker.walker(
    workingDir || path.posix.resolve(),
    []
  );
  let fileData: Array<File> = parser.parser(candidateFilePaths);
  generator.generator(
    fileData,
    outputDir
  );
};

run(argv.slice(2, argv.length));
