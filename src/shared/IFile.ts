export interface File {
  filePath: string;
  prefix: string;
  name: string;
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
