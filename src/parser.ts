const fs = require("fs");
import { File, Input, Output } from "./shared/IFile";
import * as logger from "./shared/logger";

// TODO: Rename project ng-vs-snippets instead of angular-vs-snippets
//TODO: Test in in other OS (github actions)
// TODO: Read files synchronously
export const parser = (filePaths: Array<string>): Array<File> => {
  let result: Array<File> = [];

  for (const filePath of filePaths) {
    const file: string = fs.readFileSync(filePath, {
      encoding: "utf8",
      flag: "r",
    });

    if (
      file?.match(/(@Component)/g)?.length == 0 &&
      file?.match(/@Input/g)?.length == 0 &&
      file?.match(/@Output/g)?.length == 0
    ) {
      logger.log("No component, Inputs or Outputs defined in this file");
      continue;
    }

    let fileNameData: Array<string> = file?.match(
      /export(\s+)class(\s+)[a-zA-Z]+/g
    ) || [""];
    if (fileNameData.length === 0) {
      logger.err("Component tag not defined by any class.");
      continue;
    }
    // we consider only one component per file
    fileNameData[0].replace(/(\s+)/, " ");
    const componentName: string = fileNameData[0].split(" ")[2];
    logger.log("Name of the component:", componentName);

    // match returns a string not an array
    let componentSelectorData: Array<string> = file?.match(
      /selector:(\s+)\"[a-zA-Z-_]+\"/g
    ) || [""];
    if (componentSelectorData.length === 0) {
      logger.err("Component doesn't define any selector.");
      continue;
    }
    componentSelectorData[0].replace(/(\s+)/, " ");
    const selector: string = componentSelectorData[0]
      .split(" ")[1]
      .replace('"', "")
      .replace('"', "");
    logger.log("Selector:", selector);

    // input literal type
    // @Input() variableName: 'type1' | 'type2' | 'type3'; and
    // @Input() variableName: 'type1' | 'type2' | 'type3' = 'type1';
    // notice we ignore the default value of the input in the regex
    let inputs: Array<Input> = [];
    let inputsData: Array<string> = file?.match(
      /@Input\(\)(\s+)[A-Za-z0-9]+:((\s+)(('|")[A-Za-z0-9]+('|")((\s+)\|)))+(\s+)('|")[A-Za-z0-9]+('|")(;|:|)/g
    ) || [""];
    for (let input of inputsData) {
      console.log(inputsData);
      let tmp: Array<string> = input.replace(/(\s)+/g, " ").split(" ");
      let type = tmp
        .slice(2, tmp.length)
        .join()
        .replace(";", "")
        .replace(/,/g, "");
      inputs.push({
        inputName: tmp[1].replace(":", ""),
        type,
      });
    }

    // @Input() variableName: type; and @Input() variableName: number = 9;
    inputsData = [];
    inputsData = file?.match(
      /@Input\(\)(\s+)[A-Za-z]+:(\s+)[A-Za-z]+((;|)|(\s+)[A-Za-z0-9]+(\s+)=(\s+)[A-Za-z0-9]+(;|))/g
    ) || [""];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/, " ").split(" ");
      inputs.push({
        inputName: tmp[1].replace(":", ""),
        type: tmp[2].replace(";", ""),
      });
    }

    inputsData = [];
    // @Input('inputName') varName: type; and @Input("inputName") varName: type
    inputsData = file?.match(
      /@Input\(('|")[A-Za-z]+('|")\)(\s+)[A-Za-z]+:(\s+)[A-Za-z]+\;/g
    ) || [""];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/, " ").split(" ");
      const inputName = (tmp[0].match(/('|")[A-Za-z]+('|")/g) || [
        "",
      ])[0].replace(/'|"/g, "");
      inputs.push({
        inputName,
        type: tmp[2].replace(";", ""),
      });
    }

    // @Input('inputNameC') varName = 'adv';
    // @Input("inputNameD") varName = 2354;
    inputsData = [];
    inputsData = file?.match(
      /@Input\(("|')[A-Za-z0-9]+("|')\)(\s+)[A-Za-z0-9]+(\s+)=(\s+)[A-Za-z0-9"']+(;|)/g
    ) || [""];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/, " ").split(" ");
      const inputName = (tmp[0].match(/('|")[A-Za-z]+('|")/g) || [
        "",
      ])[0].replace(/'|"/g, "");
      inputs.push({
        inputName,
        type: undefined,
      });
    }

    // @Input() variableName; and @Input() variableName. Also for now we will parse
    // in this part of the code @Input() variableName = value and @Input() variableName = value;
    inputsData = [];
    inputsData = file?.match(/@Input\(\)(\s+)[A-Za-z0-9]+(;|)/g) || [""];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
      const inputName = tmp[1].replace(";", "");
      if (inputs.filter((elem) => elem.inputName == inputName).length > 0) {
        continue;
      }
      inputs.push({
        inputName,
        type: undefined,
      });
    }
    logger.log("Inputs detected:", inputs);

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
    logger.log("Outputs detected:", outputs);
    result.push({
      fileLocation: filePath,
      prefix: selector,
      componentName: componentName,
      inputs: inputs,
      outputs: outputs,
    });
  }
  return result;
};
