import * as index from "../src/index";

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
    index.parser([
      "C:\\Users\\roger\\oos\\angular-vs-snippets\\tests\\fixtures\\parser\\main.component.ts",
    ])
  ).toStrictEqual(result);
});
