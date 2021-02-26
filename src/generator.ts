import { File } from "./shared/IFile";
import * as logger from "./shared/logger";
const fs = require("fs");
const path = require("path");
// {
//     "Simple Button Component": {
//         "scope": "html",
//         "prefix": "gl-button",
//         "body": [
//             "<gl-button (click)=\"$1\" theme=\"${2|primary,secondary,success,danger,warning,info,light,dark,muted,white,link,outline-primary|}\" [outline]=\"${3|false,true|}\" size=\"${4|md,lg,sm|}\" [block]=\"${5|false,true|}\" [disabled]=\"${6|false,true|}\" iconLeft=\"$7\" iconRight=\"$8\">",
//             "{{ '$7' | translate }}",
//             "</gl-button>"
//         ]
//     },
// }
export const generator = (files: Array<File>, outputPath: string): void => {
  // TODO: Add options (like in theme input) in case the string type contains | characters
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
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  console.log("writing file in path:", dir);
  fs.writeFileSync(dir, "");
  fs.appendFileSync(dir, JSON.stringify(json, null, 4));
};
