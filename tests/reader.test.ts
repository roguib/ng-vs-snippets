import * as reader from "../src/reader";
const path = require("path");

test("Inspects /tests/fixtures/ts-files with reader function", () => {
  expect(reader.reader(path.join(path.posix.resolve(), "tests/fixtures/ts-files"))).toStrictEqual([
    {
      type: "COMPONENT",
      filePath: path.join(path.posix.resolve(), "/tests/fixtures/ts-files/foo.ts"),
      fileData:
        'import { Input } from "@angular/core";\r\n' +
        "\r\n" +
        "export class BaseComponent {\r\n" +
        '  @Input() baseInput: "type1" | "type2" | "type3";\r\n' +
        "}\r\n",
    },
  ]);
});
