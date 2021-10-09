import * as reader from "../src/reader";
const path = require("path");
const fs = require("fs");

test("Inspects /tests/fixtures/ts-files with reader function", () => {
  expect(reader.reader(path.join(path.posix.resolve(), "tests/fixtures/ts-files"))).toStrictEqual([
    {
      type: "CLASS",
      filePath: path.join(path.posix.resolve(), "tests/fixtures/ts-files/foo.ts"),
      fileData: fs.readFileSync(path.join(path.posix.resolve(), "tests/fixtures/ts-files/foo.ts"), {
        encoding: "utf8",
        widthFileTypes: true,
      }),
    },
    {
      type: "COMPONENT",
      filePath: path.join(path.posix.resolve(), "tests/fixtures/ts-files/var.ts"),
      fileData: fs.readFileSync(path.join(path.posix.resolve(), "tests/fixtures/ts-files/var.ts"), {
        encoding: "utf8",
        withFileTypes: true,
      }),
    },
  ]);
});
