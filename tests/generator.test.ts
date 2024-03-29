import * as generator from "../src/generator";
const fs = require("fs");
const path = require("path");

test("JSON file generation", async () => {
  generator.generator(
    [
      {
        componentName: "MainComponent",
        prefix: "app-main",
        inputs: [
          { inputName: "appName", type: "MediaModel" },
          { inputName: "var", type: "'type1' | 'type2'" },
          { inputName: "foo", type: "TypeError" },
          { inputName: "fooStr", type: "string" },
        ],
        outputs: [
          { outputName: "buttonClick", type: "any" },
          { outputName: "fooVar", type: "number" },
        ],
        filePath: path.join(path.posix.resolve(), "/tests/fixtures/parser/main.component.ts"),
        extendedClassFilepath: undefined,
      },
    ],
    path.join(path.posix.resolve(), "/out")
  );
  const expectedResult =
    '{"MainComponent": { "scope": "html", "prefix": "app-main", "body": [ "<app-main [appName]="$1" [var]="${2|type1,type2|}" [foo]="$3" fooStr="$4" (buttonClick)="$5" (fooVar)="$6"></app-main>" ] } }'.replace(
      /\s/g,
      ""
    );
  const data = fs.readFileSync(path.join(path.posix.resolve(), "/out/out.code-snippets"), "utf-8").replace(/\s+/g, "").replace(/\\/g, "");
  expect(data).toEqual(expectedResult);
});
