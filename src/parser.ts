const fs = require("fs");
const path = require("path");

import { FileType } from "./shared/constants";
import { File, Input, Output } from "./shared/IFile";
import { IFileData } from "./shared/IFileData";
import logger from "./shared/logger";
import pathResolver from "./utils/path-resolver";
import { REGEX_SELECTORS } from "./utils/regexSelectors";

// TODO: Test in other OS (github actions)
/**
 *
 * @param {IFIleData} data An array of files that can contain component or class definitions
 * @returns {File} An array filed of tokens that contains information about each component parsed
 */
export const parser = (data: Array<IFileData>): Array<File> => {
  let result: Array<File> = [],
    tmp: Array<Partial<File>> = []; // a temporal variable used for storing @Inputs/@Outputs declared on a parent class

  for (const item of data) {
    let containsComponentDef = item.type === "COMPONENT" ? true : false;

    if (!containsComponentDef && item.fileData?.match(/@Input/g) == null && item.fileData?.match(/@Output/g) == null) {
      logger.log("No component, Inputs or Outputs defined in this file:", item.filePath);
      continue;
    }

    let fileNameData: Array<string> = item.fileData?.match(REGEX_SELECTORS.componentSelector) || [];
    if (fileNameData.length === 0) {
      logger.warn("Component tag not defined by any class.");
      continue;
    }

    // we consider only one component per file
    fileNameData[0].replace(/(\s+)/, " ");
    const componentName: string = fileNameData[0].split(" ")[2];
    logger.log("Name of the component:", componentName);

    let selector = "";
    if (containsComponentDef) {
      // match returns a string not an array
      let componentSelectorData: Array<string> = item.fileData?.match(REGEX_SELECTORS.componentHTMLselector) || [];
      if (componentSelectorData.length === 0) {
        logger.warn("Component doesn't define any selector but contains @Component anotation:", item.filePath);
        continue;
      }
      componentSelectorData[0].replace(/(\s+)/g, " ");
      selector = componentSelectorData[0].split(" ")[1].replace(/('|")/g, "");
      logger.log("Selector:", selector);
    }

    let inputs: Array<Input> = parseInputs(item.fileData),
      outputs: Array<Output> = parseOutputs(item.fileData);

    let extendedClassPath;
    if (item.fileData?.match(REGEX_SELECTORS.extendedClassSelector)) {
      // we should see if the extended class is in tmp and if not extract the inputs defined inside
      let matchExtendedClass: Array<string> = item.fileData?.match(REGEX_SELECTORS.extendedClassSelector) || [];
      // resolve the path of the class
      let extendedClass: string = matchExtendedClass[0].replace(/(\s+)/g, " ").split(" ")[4];
      logger.log("extendedClassName:", extendedClass);
      let matchExtendedClassPath: Array<string> = item.fileData?.match(REGEX_SELECTORS.extendedClassPathSelector) || [];

      extendedClassPath = pathResolver.resolve(item.filePath, matchExtendedClassPath[0]);

      logger.log("path:", extendedClassPath);
    }

    if (containsComponentDef) {
      result.push({
        filePath: item.filePath,
        prefix: selector,
        componentName: componentName,
        inputs: inputs,
        outputs: outputs,
        extendedClassFilepath: extendedClassPath || undefined,
      });
    } else {
      /**
       * TODO: Instead of working with relative paths and converting them
       * to absolute when needed, we can start the exec by transforming every
       * relative path to absolute, and then clean up the resolve calls in the program
       * that transforms the code into an spaguetti one. Also it could help by reducing
       * the amount of times we call path.join(path.posix.resolve(), path);
       */
      tmp.push({
        filePath: path.resolve(item.filePath),
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
        if (result[i].extendedClassFilepath === tmp[j].filePath) {
          result[i].inputs = [...result[i].inputs, ...(tmp[j].inputs as [])] as Input[];
          result[i].outputs = [...result[i].outputs, ...(tmp[j].outputs as [])] as Output[];
          break;
        }
      }
    }
  }
  return result;
};

/**
 * @private
 * @param {string} file a string where to look for input definitions
 * @returns {Array<Input>} An array containing all the inputs defined in the given string
 */
const parseInputs = (file: string): Array<Input> => {
  // notice we ignore the default value of the input in the regex
  // Input() foo: 'type1' | 'type2'
  let inputsData: Array<string> = file?.match(REGEX_SELECTORS.regularInputLiteralTypeSelector) || [],
    inputs: Array<Input> = [];
  for (let input of inputsData) {
    logger.log("inputs parsed:", inputsData);
    let tmp: Array<string> = input.replace(/(\s)+/g, " ").split(" ");
    let type = tmp.slice(2, tmp.length).join().replace(/\"/g, "'").replace(";", "").replace(/,/g, "");
    inputs.push({
      inputName: tmp[1].replace(":", ""),
      type,
    });
  }
  file = file.replace(REGEX_SELECTORS.regularInputLiteralTypeSelector, "");

  // @Input() variableName: type; and @Input() variableName: number = 9;
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.regularInputWithTypeSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    inputs.push({
      inputName: tmp[1].replace(":", ""),
      type: tmp[2].replace(";", ""),
    });
  }
  file = file.replace(REGEX_SELECTORS.regularInputWithTypeSelector, "");

  inputsData = [];
  // @Input('inputName') varName: type; and @Input("inputName") varName: type
  inputsData = file?.match(REGEX_SELECTORS.customNameInputWithTypeSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    const inputName = (tmp[0].match(/('|")[a-zA-Z0-9-_]+('|")/g) || [])[0].replace(/'|"/g, "");
    inputs.push({
      inputName,
      type: tmp[2].replace(";", ""),
    });
  }
  file = file.replace(REGEX_SELECTORS.customNameInputWithTypeSelector, "");

  // @Input('inputNameC') varName = 'adv';
  // @Input("inputNameD") varName = 2354;
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.setterInputCustomNameSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    const inputName = (tmp[0].match(/('|")[a-zA-Z0-9-_]+('|")/g) || [""])[0].replace(/'|"/g, "");
    inputs.push({
      inputName,
      type: undefined,
    });
  }
  file = file.replace(REGEX_SELECTORS.setterInputCustomNameSelector, "");

  //@Input() set foo(value) {}
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.setterInputSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    const inputName = tmp[2].replace(/(\s+)/g, "").split("(")[0];
    inputs.push({
      inputName,
      type: undefined,
    });
  }
  file = file.replace(REGEX_SELECTORS.setterInputSelector, "");

  //@Input() set foo(value: type) {}
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.setterInputWithTypeSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    const inputName = tmp[2].replace(/(\s+)/g, "").split("(")[0];
    const type = tmp[3].replace(/(\s+)/g, "").split(")")[0];
    inputs.push({
      inputName,
      type,
    });
  }
  file = file.replace(REGEX_SELECTORS.setterInputWithTypeSelector, "");

  //@Input() set foo(value: 'type1' | 'type2') {}
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.setterInputLiteralTypeSelector) || [];
  for (let input of inputsData) {
    let tmp: Array<string> = input.replace(/(\s+)/g, " ").split(" ");
    const inputName = tmp[2].replace(/(\s+)/g, "").split("(")[0];
    const type = tmp
      .slice(3, tmp.length)
      .join()
      .replace(/'|"|\)/g, "")
      .replace(/,/g, " ");
    inputs.push({
      inputName,
      type,
    });
  }
  file = file.replace(REGEX_SELECTORS.setterInputLiteralTypeSelector, "");

  // @Input() variableName; and @Input() variableName. Also for now we will parse
  // in this part of the code @Input() variableName = value and @Input() variableName = value;
  inputsData = [];
  inputsData = file?.match(REGEX_SELECTORS.regularInputSelector) || [];
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
  file = file.replace(REGEX_SELECTORS.regularInputSelector, "");
  logger.log("Inputs detected:", inputs);
  return inputs;
};

/**
 * @private
 * @param {string} file a string where to look for output definitions
 * @returns {Array<Input>} An array containing all the outputs defined in the given string
 */
const parseOutputs = (file: string): Array<Output> => {
  let outputs: Array<Output> = [];
  // only @Output() buttonClick: EventEmitter<any> = new EventEmitter(); for now
  let outputsData: Array<string> = file?.match(REGEX_SELECTORS.regularOutputSelector) || [];
  for (let output of outputsData) {
    let tmp: Array<string> = output.replace(/(\s+)/g, " ").split(" ");
    outputs.push({
      outputName: tmp[1].replace(":", ""),
      type: tmp[2].substr(tmp[2].indexOf("<"), tmp[2].indexOf(">")).replace(">", "").replace("<", ""),
    });
  }
  file = file.replace(REGEX_SELECTORS.regularOutputSelector, "");
  logger.log("Outputs detected:", outputs);

  return outputs;
};
