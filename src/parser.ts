const fs = require("fs");
const path = require("path");

import { File, Input, Output } from "./shared/IFile";
import * as logger from "./shared/logger";

// TODO: Rename project ng-vs-snippets instead of angular-vs-snippets
//TODO: Test in in other OS (github actions)
// TODO: Read files synchronously
export const parser = (filePaths: Array<string>): Array<File> => {
  let result: Array<File> = [];
  // a temporal variable used for storing @Inputs/@Outputs declared on a parent class
  let tmp: Array<Partial<File>> = [];

  for (const filePath of filePaths) {
    const file: string = fs.readFileSync(filePath, {
      encoding: "utf8",
      flag: "r",
    });

    let containsComponentDef = false;
    if (file?.match(/(@Component)/g)?.length || 0 > 0) {
      containsComponentDef = true;
    }

    if (
      !containsComponentDef &&
      file?.match(/@Input/g)?.length == 0 &&
      file?.match(/@Output/g)?.length == 0
    ) {
      logger.log("No component, Inputs or Outputs defined in this file");
      continue;
    }

    let fileNameData: Array<string> =
      file?.match(/export(\s+)class(\s+)[a-zA-Z]+/g) || [];
    if (fileNameData.length === 0) {
      logger.err("Component tag not defined by any class.");
      continue;
    }
    // we consider only one component per file
    fileNameData[0].replace(/(\s+)/, " ");
    const componentName: string = fileNameData[0].split(" ")[2];
    logger.log("Name of the component:", componentName);

    let selector = "";
    if (containsComponentDef) {
      // match returns a string not an array
      let componentSelectorData: Array<string> =
        file?.match(/selector:(\s+)\"[a-zA-Z-_]+\"/g) || [];
      if (componentSelectorData.length === 0) {
        logger.err(
          "Component doesn't define any selector but contains @Component anotation."
        );
        continue;
      }
      componentSelectorData[0].replace(/(\s+)/g, " ");
      selector = componentSelectorData[0]
        .split(" ")[1]
        .replace('"', "")
        .replace('"', "");
      logger.log("Selector:", selector);
    }

    // input literal type
    // @Input() variableName: 'type1' | 'type2' | 'type3'; and
    // @Input() variableName: 'type1' | 'type2' | 'type3' = 'type1';
    // notice we ignore the default value of the input in the regex
    let inputs: Array<Input> = [];
    let inputsData: Array<string> =
      file?.match(
        /@Input\(\)(\s+)[A-Za-z0-9]+:((\s+)(('|")[A-Za-z0-9]+('|")((\s+)\|)))+(\s+)('|")[A-Za-z0-9]+('|")(;|:|)/g
      ) || [];
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
    inputsData =
      file?.match(
        /@Input\(\)(\s+)[A-Za-z]+:(\s+)[A-Za-z]+((;|)|(\s+)[A-Za-z0-9]+(\s+)=(\s+)[A-Za-z0-9]+(;|))/g
      ) || [];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
      console.log("input data", inputsData);
      inputs.push({
        inputName: tmp[1].replace(":", ""),
        type: tmp[2].replace(";", ""),
      });
    }

    inputsData = [];
    // @Input('inputName') varName: type; and @Input("inputName") varName: type
    inputsData =
      file?.match(
        /@Input\(('|")[A-Za-z]+('|")\)(\s+)[A-Za-z]+:(\s+)[A-Za-z]+\;/g
      ) || [];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
      const inputName = (tmp[0].match(/('|")[A-Za-z]+('|")/g) || [])[0].replace(
        /'|"/g,
        ""
      );
      inputs.push({
        inputName,
        type: tmp[2].replace(";", ""),
      });
    }

    // @Input('inputNameC') varName = 'adv';
    // @Input("inputNameD") varName = 2354;
    inputsData = [];
    inputsData =
      file?.match(
        /@Input\(("|')[A-Za-z0-9]+("|')\)(\s+)[A-Za-z0-9]+(\s+)=(\s+)[A-Za-z0-9"']+(;|)/g
      ) || [];
    for (let input of inputsData) {
      let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
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
    let outputsData: Array<string> =
      file?.match(
        /@Output\(\)(\s+)[A-Za-z]+:(\s+)EventEmitter<[A-Za-z]+>(\s+)=(\s+)new(\s+)EventEmitter\(\);/g
      ) || [];
    for (let output of outputsData) {
      let tmp: Array<string> = output.replace(/(\s+)/g, " ").split(" ");
      outputs.push({
        outputName: tmp[1].replace(":", ""),
        type: tmp[2]
          .substr(tmp[2].indexOf("<"), tmp[2].indexOf(">"))
          .replace(">", "")
          .replace("<", ""),
      });
    }
    logger.log("Outputs detected:", outputs);

    let extendedClassPath;
    if (
      file?.match(
        /export(\s+)class(\s+)[A-Za-z0-9]+(\s+)extends(\s+)[A-Za-z0-9]+/g
      )
    ) {
      // we should see if the extended class is in tmp and if not extract the inputs defined inside
      let matchExtendedClass: Array<string> =
        file?.match(
          /export(\s+)class(\s+)[A-Za-z0-9]+(\s+)extends(\s+)[A-Za-z0-9]+/g
        ) || [];
      // resolve the path of the class
      let extendedClass: string = matchExtendedClass[0]
        .replace(/(\s+)/g, " ")
        .split(" ")[4];
      console.log("extendedClassName:", extendedClass);
      let matchExtendedClassPath: Array<string> =
        file?.match(
          /import(\s+){(\s+)[A-Za-z0-9]+(\s+)}(\s+)from(\s+)[\/A-Za-z0-9."_-]+/g
        ) || [];
      extendedClassPath = path.join(
        path.dirname(filePath),
        matchExtendedClassPath[0]
          .replace(/(\s+)/g, " ")
          .replace(/"/g, "")
          .split(" ")[5] + ".ts"
      );
      console.log("path:", extendedClassPath);
    }

    if (containsComponentDef) {
      result.push({
        fileLocation: filePath,
        prefix: selector,
        componentName: componentName,
        inputs: inputs,
        outputs: outputs,
        extendedClassFilepath: extendedClassPath || undefined,
      });
    } else {
      tmp.push({
        fileLocation: filePath,
        inputs: inputs,
        outputs: outputs,
        extendedClassFilepath: undefined,
      });
    }
  }
  // we're asuming there  won't be a lot of classes extending others
  // we could make this algorithm more efficient by storing tmp variables on a dicc
  // instead of iterating over the array every time
  // TODO: Make it efficient, its O(n^m)!!!
  for (let i = 0; i < result.length; ++i) {
    if (result[i].extendedClassFilepath) {
      for (let j = 0; j < tmp.length; ++j) {
        if (result[i].extendedClassFilepath === tmp[j].fileLocation) {
          result[i].inputs = [
            ...result[i].inputs,
            ...(tmp[j].inputs as []),
          ] as Input[];
          result[i].outputs = [
            ...result[i].outputs,
            ...(tmp[j].outputs as []),
          ] as Output[];
          break;
        }
      }
    }
  }
  return result;
};
