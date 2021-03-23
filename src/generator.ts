import { File } from "./shared/IFile";
import logger from "./shared/logger";
const fs = require("fs");
const path = require("path");

export const generator = (files: Array<File>, outputPath: string): void => {
  // scope will be html only for now
  let json = Object();
  for (const file of files) {
    let component = Object();
    component.scope = "html";
    component.prefix = file.prefix;
    let inputs = "";
    let index = 1;
    for (let input of file.inputs) {
      if (input.type?.indexOf('|') != -1 && input.type) {
        inputs += ` [${input.inputName}]=\"$\{${index}\|${input.type.replace(/(\s)\|(\s)/g, ',').replace(/'/g, '')}\|\}\"`;
      }
      else {
        inputs += ` [${input.inputName}]=\"$${index}\"`;
      }
      ++index;
    }
    let outputs = "";
    for (let output of file.outputs) {
      outputs += ` (${output.outputName})=\"$${index}\"`;
      ++index;
    }
    component.body = [
      `<${file.prefix}` + inputs + outputs + `></${file.prefix}>`,
    ];
    json[file.componentName] = {
      ...component
    };
  }
  const dir = path.join(outputPath, "/out.code-snippets");
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  logger.log("writing file in path:", dir);
  fs.writeFileSync(dir, "");
  fs.appendFileSync(dir, JSON.stringify(json, null, 4));
};
