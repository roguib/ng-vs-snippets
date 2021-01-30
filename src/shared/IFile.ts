export interface File {
  fileLocation: string;
  prefix: string;
  componentName: string;
  inputs: Array<Input>;
  outputs: Array<Output>;
}

export interface Input {
  inputName: string;
  type: string | undefined;
}

export interface Output {
  outputName: string;
  type: string;
}
