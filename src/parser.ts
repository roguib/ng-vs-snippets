const fs = require("fs");
const path = require("path");

import { FileType } from "./shared/constants";
import { File, Input, Output } from "./shared/IFile";
import { IFileData } from "./shared/IFileData";
import logger from "./shared/logger";
import pathResolver from "./utils/path-resolver";
import { REGEX_SELECTORS } from "./utils/regexSelectors";

/**
 *
 * @param {IFIleData} data An array of files that can contain component or class definitions
 * @returns {File} An array filed of tokens that contains information about each component parsed
 */
export const parser = (data: Array<IFileData>): Array<File> => {
  let result: Array<File> = [],
    tmp: Array<Partial<File>> = []; // a temporal variable used for storing @Inputs/@Outputs declared on a parent class

  for (const item of data) {
    let parsedData;
    switch (item.type) {
      case "CLASS":
        parsedData = parseClassDefinition(item);
        if (parsedData) {
          tmp.push(parsedData);
        }
        break;
      case "PIPE":
        parsedData = parsePipeDefinition(item);
        if (parsedData) {
          tmp.push(parsedData);
        }
      default:
        parsedData = parseComponentDefinition(item);
        if (parsedData) {
          result.push(parsedData);
        }
        break;
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
 * @param {IFIleData} file A file that is CLASS type
 * @returns {string | undefined} A token with the data extracted from the class definition file
 */
const parseClassDefinition = (file: IFileData): Partial<File> | undefined => {
  if (file.fileData?.match(/@Input/g) == null && file.fileData?.match(/@Output/g) == null) {
    logger.log("No Inputs or Outputs defined in this file class:", file.filePath);
    return undefined;
  }

  const inputs: Array<Input> = parseInputs(file.fileData),
    outputs: Array<Output> = parseOutputs(file.fileData),
    extendedClassFilepath = parseExtendedClassPath(file);
  /**
   * TODO: Instead of working with relative paths and converting them
   * to absolute when needed, we can start the exec by transforming every
   * relative path to absolute, and then clean up the resolve calls in the program
   * that transforms the code into an spaguetti one. Also it could help by reducing
   * the amount of times we call path.join(path.posix.resolve(), path);
   */
  return {
    filePath: file.filePath,
    inputs,
    outputs,
    extendedClassFilepath,
  };
};

/**
 * @private
 * @param {IFIleData} file A file that is PIPE type
 * @returns {string | undefined} A token with the data extracted from the class definition file. Each parameter
 * of the transform function is parsed as an input. Hence, this function returns an object with inputs arrays defined
 * and without outputs
 */
const parsePipeDefinition = (file: IFileData): Partial<File> | undefined => {
  const pipeAnnotation: Array<string> = file.fileData?.match(/\@Pipe\(\{name\:(\s+|)\'[A-Za-z0-9]+\'\}\)/g) || [];
  if (pipeAnnotation.length === 0) {
    logger.warn("Pipe does not have a defined name.");
    return undefined;
  }

  // we consider only one pipe per file
  const prefixArray: Array<string> = pipeAnnotation[0].match(/name\:(\s+|)\'[A-Za-z0-9]+\'/g) || [];
  const prefix = prefixArray[0].split(':')[1];
  logger.log("Prefix of the pipe:", prefix);

  const nameArray: Array<string> = pipeAnnotation[0].match(/export(\s+)class(\s+)[A-Za-z0-9]+/g) || [];
  const name: string = nameArray[0].split(" ")[2];
  logger.log("Name of the pipe:", name);

  //TODO:
  let transformFunc: Array<string> = file.fileData?.match(/transform\([A-Za-z0-9\:\,\_\-]+\)/g) || [];

  const extendedClassFilepath = parseExtendedClassPath(file);

  return {
    filePath: file.filePath,
    prefix,
    name,
    // TODO: inputs,
    extendedClassFilepath,
  };
};

/**
 * @private
 * @param {IFIleData} file A file that is COMPONENT type
 * @returns {string | undefined} A token with the data extracted from the class definition file
 */
const parseComponentDefinition = (file: IFileData): File | undefined => {
  const containsInputsOrOutputs = file.fileData?.match(/@Input/g) != null || file.fileData?.match(/@Output/g) != null;
  if (!containsInputsOrOutputs) {
    logger.log("No component, Inputs or Outputs defined in this file:", file.filePath);
  }

  const componentName = parseComponentName(file.fileData),
    prefix = parseComponentSelector(file);
  if (!componentName || !prefix) {
    return undefined;
  }
  const inputs: Array<Input> = containsInputsOrOutputs ? parseInputs(file.fileData) : [],
    outputs: Array<Output> = containsInputsOrOutputs ? parseOutputs(file.fileData) : [],
    extendedClassFilepath = parseExtendedClassPath(file);

  return {
    filePath: file.filePath,
    prefix,
    name: componentName,
    inputs,
    outputs,
    extendedClassFilepath,
  };
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

/**
 * @private
 * @param {IFIleData} file The class definition that is candidate to extend another class
 * @returns {string | undefined} The absolute resolved extended class path or undefined if doesn´t extend any class
 */
const parseExtendedClassPath = (file: IFileData): string | undefined => {
  let extendedClassPath: string | undefined;
  if (file.fileData?.match(REGEX_SELECTORS.extendedClassSelector)) {
    // we should see if the extended class is in tmp and if not extract the inputs defined inside
    let matchExtendedClass: Array<string> = file.fileData?.match(REGEX_SELECTORS.extendedClassSelector) || [];
    // resolve the path of the class
    let extendedClass: string = matchExtendedClass[0].replace(/(\s+)/g, " ").split(" ")[4];
    logger.log("extendedClassName:", extendedClass);
    let matchExtendedClassPath: Array<string> = file.fileData?.match(REGEX_SELECTORS.extendedClassPathSelector) || [];
    if (matchExtendedClassPath.length === 0) {
      logger.log("Unable to parse import path in file:", file.filePath);
      return undefined;
    }

    extendedClassPath = pathResolver.resolve(file.filePath, matchExtendedClassPath[0]) as string;

    logger.log("path:", extendedClassPath);
  }

  return extendedClassPath;
};

/**
 * @private
 * @param {string} file
 * @returns {string | undefined} The name of the component
 */
const parseComponentName = (file: string): string | undefined => {
  let fileNameData: Array<string> = file?.match(REGEX_SELECTORS.componentSelector) || [];
  if (fileNameData.length === 0) {
    logger.warn("Component tag not defined by any class.");
    return undefined;
  }

  // we consider only one component per file
  fileNameData[0].replace(/(\s+)/, " ");
  const componentName: string = fileNameData[0].split(" ")[2];
  logger.log("Name of the component:", componentName);
  return componentName;
};

/**
 * @private
 * @param {IFIleData} file
 * @returns {string | undefined} The component selector
 */
const parseComponentSelector = (file: IFileData): string | undefined => {
  let selector;
  // match returns a string not an array
  let componentSelectorData: Array<string> = file.fileData?.match(REGEX_SELECTORS.componentHTMLselector) || [];
  if (componentSelectorData.length === 0) {
    logger.warn("Component doesn't define any selector but contains @Component anotation:", file.filePath);
    return undefined;
  }
  componentSelectorData[0].replace(/(\s+)/g, " ");
  selector = componentSelectorData[0].split(" ")[1].replace(/('|")/g, "");
  logger.log("Selector:", selector);
  return selector;
};
