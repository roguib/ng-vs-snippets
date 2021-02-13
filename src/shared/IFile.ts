export interface File {
  fileLocation: string;
  prefix: string;
  componentName: string;
  inputs: Array<Input>;
  outputs: Array<Output>;
  extendedClassFilepath: string | undefined;
}

export interface Input {
  inputName: string;
  type: string | undefined;
}

export interface Output {
  outputName: string;
  type: string;
}
