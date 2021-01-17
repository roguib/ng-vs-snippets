const index = require("../src/index");
const path = require("path");

// TODO: We should remove full path of the project since this test is not going to pass in another computer
test("Inspects /tests/fixtures/ts-files with walker function", () => {
  expect(
    index.walker(path.join(path.posix.resolve(), "tests/fixtures/ts-files"), [])
  ).toStrictEqual([
    "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\ts-files\\foo.ts",
    "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\ts-files\\index.ts",
  ]);
});
