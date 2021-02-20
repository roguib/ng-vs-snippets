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
        { inputName: "var", type: "'type1' | 'type2'" },
        { inputName: "foo", type: "TypeError" },
      ],
      outputs: [
        { outputName: "buttonClick", type: "any" },
        { outputName: "fooVar", type: "number" },
      ],
      fileLocation: path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/main.component.ts"
      ),
      extendedClassFilepath: undefined
    }
  ], path.join(path.posix.resolve(), "/out"));
  const expectedResult = '{"component": { "scope": "html", "prefix": "app-main", "body": [ "<app-main [appName]="$1" [var]="${2|type1,type2|}" [foo]="$3" (buttonClick)="$4" (fooVar)="$5"></app-main>" ] } }'.replace(
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
