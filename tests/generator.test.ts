import * as generator from "../src/generator";
const fs = require("fs");
const path = require("path");

test("JSON file generation", async () => {
  generator.generator([
    {
      componentName: "MainComponent",
      prefix: "app-main",
      inputs: [
        { inputName: "appName", type: "MediaModel" },
        { inputName: "foo", type: "TypeError" },
      ],
      outputs: [
        { outputName: "buttonClick", type: "any" },
        { outputName: "fooVar", type: "number" },
      ],
      fileLocation:
        "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\parser\\main.component.ts",
    },
  ]);
  const expectedResult = '{"component": { "scope": "html", "prefix": "app-main", "body": [ "<app-main[appName]="$1"[foo]="$2" [buttonClick]="$3"[fooVar]="$4"></app-main>" ] } }'.replace(
    /\s/g,
    ""
  );
  const data = fs
    .readFileSync(
      path.join(path.posix.resolve(), "/out/out.code-snippets"),
      "utf-8"
    )
    .replace(/\s+/g, "")
    .replace(/\\/g, "");
  expect(data).toEqual(expectedResult);
});
