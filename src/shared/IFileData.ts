import { FileType } from "./constants";

export interface IFileData {
  type: FileType;
  filePath: string;
  fileData: string;
}
