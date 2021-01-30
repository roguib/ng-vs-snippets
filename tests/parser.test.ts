import * as parser from "../src/parser";

test("Parses the contents of the candidate files and returns an array of File type", async () => {
  const result = [
    {
      componentName: "MainComponent",
      fileLocation:
        "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\parser\\main.component.ts",
      inputs: [
        {
          inputName: "appName",
          type: "MediaModel",
        },
        {
          inputName: "foo",
          type: "TypeError",
        },
        {
          inputName: "numberInput",
          type: "number",
        },
        {
          inputName: "inputNameA",
          type: "type",
        },
        {
          inputName: "inputNameB",
          type: "type",
        },
        {
          inputName: "withoutType",
          type: undefined,
        },
        {
          inputName: "withoutTypeNorSemicolon",
          type: undefined,
        },
      ],
      outputs: [
        {
          outputName: "buttonClick",
          type: "any",
        },
        {
          outputName: "fooVar",
          type: "number",
        },
      ],
      prefix: "app-main",
    },
  ];
  expect(
    parser.parser([
      "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\parser\\main.component.ts",
    ])
  ).toStrictEqual(result);
});
