import { markAsUntransferable } from "worker_threads";
import * as walker from "../src/walker";
const path = require("path");

test("Inspects /tests/fixtures/ts-files with walker function", () => {
  expect(walker.walker(path.join(path.posix.resolve(), "tests/fixtures/ts-files"), [])).toStrictEqual([
    path.join(path.posix.resolve(), "/tests/fixtures/ts-files/foo.ts"),
    path.join(path.posix.resolve(), "/tests/fixtures/ts-files/index.ts"),
  ]);
});
