const path = require("path");
const argv = process.argv;
import * as walker from "./walker";
import * as parser from "./parser";
import * as generator from "./generator";
import { File } from "./shared/IFile";
import logger from "./shared/logger";
import { ICLIConfig } from "./shared/ICLIConfig";

let config: ICLIConfig = {
  workingDir: null,
  outputDir: null,
  debug: false,
};

const parseArgs = (args: string[]) => {
  // TODO: Include multiple options

  logger.log("args:", args);

  while (args.length > 0) {
    const arg = args.shift();

    if (arg == null) break;

    if (arg == "--dir") {
      const absPath = args.shift();

      if (absPath == null) break;

      config.workingDir = absPath;
    }

    if (arg == "--output") {
      const outputPath = args.shift();

      if (outputPath == null) break;

      config.outputDir = outputPath;
    }

    if (arg == "--debug") {
      config.debug = true;
    }
  }
};

export const verifyArgs = () => {
  if (config.workingDir == null) {
    logger.err("No working directory specified. Aborting.");
  }

  if (config.outputDir == null) {
    logger.err("No output directory specified. Aborting.");
  }
};

export const run = async (args: string[]) => {
  parseArgs(args);
  verifyArgs();

  if (config.debug) {
    logger.enableDebugger();
  }

  process.env.ROOT_PROJECT_PATH = config.workingDir || path.posix.resolve();

  let candidateFilePaths: Array<string> = walker.walker(process.env.ROOT_PROJECT_PATH as string, []);
  let fileData: Array<File> = parser.parser(candidateFilePaths);
  generator.generator(fileData, config.outputDir as string);
};

run(argv.slice(2, argv.length));
