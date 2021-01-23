import { Dirent } from "fs";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// TODO: move it to another file
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

// TODO: Move it to another file
// TODO: Read files synchronously
export interface File {
  fileLocation: string;
  prefix: string;
  componentName: string;
  inputs: Array<Input>;
  outputs: Array<Output>;
}

export interface Input {
  inputName: string;
  type: string;
}

export interface Output {
  outputName: string;
  type: string;
}
export const parser = (filePaths: Array<string>): Array<File> => {
  let result: Array<File> = [];

  for (const filePath of filePaths) {
    const file: string = fs.readFileSync(filePath, {
      encoding: "utf8",
      flag: "r",
    });
    console.log(file);
    if (file?.match(/(@Component)/g)?.length == 0) {
      console.log("No component defined in this file");
      continue;
    }

    let fileNameData: Array<string> = file?.match(
      /export(\s+)class(\s+)[a-zA-Z]+/g
    ) || [""];
    if (fileNameData.length === 0) {
      continue;
    }
    // we consider only one component per file
    // remove extra spacing
    fileNameData[0].replace(/(\s+)/, " ");
    const componentName: string = fileNameData[0].split(" ")[2];
    console.log("Name of the component:", componentName);

    // match returns a string not an array
    let componentSelectorData: Array<string> = file?.match(
      /selector:(\s+)\"[a-zA-Z-_]+\"/g
    ) || [""];
    if (componentSelectorData.length === 0) {
      continue;
    }
    componentSelectorData[0].replace(/(\s+)/, " ");
    const selector: string = componentSelectorData[0]
      .split(" ")[1]
      .replace('"', "")
      .replace('"', "");
    console.log("Selector:", selector);

    // (@Input(\(\)|\(\'[A-Za-z]+\'\))(\s+)[A-Za-z]+(:(\s+)[A-Za-z]+(\;|(\s+))|\;|))|=(\s+)(\'[A-Za-z]+\')|([0-9]+)(\;|)
    // @Input() variableName: string = 'foo';
    // @Input() variableName: number = 9;
    // @Input() variableName = 9;
    // @Input('someName') variableName: string = 'foo';
    // @Input() variableName: string;
    // @Input() variableName;
    // @Input() variableName

    /// only @Input() variableName: type; for now
    let inputs: Array<Input> = [];
    let inputsData: Array<string> = file?.match(
      /@Input\(\)(\s+)[A-Za-z]+:(\s+)[A-Za-z]+\;/g
    ) || [""];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/, " ").split(" ");
      inputs.push({
        inputName: tmp[1].replace(":", ""),
        type: tmp[2].replace(";", ""),
      });
    }
    console.log("Inputs detected: ", inputs);

    let outputs: Array<Output> = [];
    // only @Output() buttonClick: EventEmitter<any> = new EventEmitter(); for now
    let outputsData: Array<string> = file?.match(
      /@Output\(\)(\s+)[A-Za-z]+:(\s+)EventEmitter<[A-Za-z]+>(\s+)=(\s+)new(\s+)EventEmitter\(\);/g
    ) || [""];
    for (let output of outputsData) {
      let tmp: Array<string> = output.replace(/(\s+)/, " ").split(" ");
      outputs.push({
        outputName: tmp[1].replace(":", ""),
        type: tmp[2]
          .substr(tmp[2].indexOf("<"), tmp[2].indexOf(">"))
          .replace(">", "")
          .replace("<", ""),
      });
    }
    console.log("Outputs detected: ", outputs);
    result.push({
      fileLocation: filePath,
      prefix: selector,
      componentName: componentName,
      inputs: inputs,
      outputs: outputs,
    });
  }
  console.log(result);
  return result;
};
