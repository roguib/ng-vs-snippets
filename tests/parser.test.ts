import * as parser from "../src/parser";
const path = require("path");

test("Parses the contents of the candidate files and returns an array of File type", async () => {
  const result = [
    {
      componentName: "MainComponent",
      extendedClassFilepath: path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/base.component.ts"
      ),
      fileLocation: path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/main.component.ts"
      ),
      inputs: [
        {
          inputName: "literalType1",
          type: "'type1'|'type2'|'type3'",
        },
        {
          inputName: "literalType2",
          type: "'type1'|'type2'|'type3'",
        },
        {
          inputName: "literal_Type3",
          type: "'type1'|'type2'|'type3'",
        },
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
          inputName: "inputNameC",
          type: undefined,
        },
        {
          inputName: "inputNameD",
          type: undefined,
        },
        {
          inputName: "Foo",
          type: undefined,
        },
        {
          inputName: "FooType",
          type: "string",
        },
        {
          inputName: "FooTypeLiteral",
          type: "literal1 | literal2 | literal3",
        },
        {
          inputName: "withoutType",
          type: undefined,
        },
        {
          inputName: "withoutTypeNorSemicolon",
          type: undefined,
        },
        {
          inputName: "variableAssignedValue",
          type: undefined,
        },
        {
          inputName: "variableAssignedValueAndSemicolon",
          type: undefined,
        },
        {
          inputName: "baseInput",
          type: "'type1'|'type2'|'type3'",
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
      path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/main.component.ts"
      ),
      path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/base.component.ts"
      ),
      path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/component.module.ts"
      ),
    ])
  ).toStrictEqual(result);
});

test("Tests the parser when de file is imported using the @ special keyword path defined in tsconfig.json", async () => {
  process.env.ROOT_PROJECT_PATH =
    "C:/Users/roger/oos/angular-vs-snippets/tests/fixtures/parser";
  const result = [
    {
      componentName: "SpecialPathComponent",
      extendedClassFilepath: path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/special-path-tsconfig/special-base.component.ts"
      ),
      fileLocation: path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/special-path-tsconfig/special-path.component.ts"
      ),
      inputs: [
        {
          inputName: "inputInChildClass",
          type: "'type1'|'type2'|'type3'",
        },
        {
          inputName: "baseInputInSpecialBaseClass",
          type: "'type1'|'type2'|'type3'",
        },
      ],
      outputs: [],
      prefix: "app-main",
    },
  ];
  expect(
    parser.parser([
      path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/special-path-tsconfig/special-base.component.ts"
      ),
      path.join(
        path.posix.resolve(),
        "/tests/fixtures/parser/special-path-tsconfig/special-path.component.ts"
      ),
    ])
  ).toStrictEqual(result);
});
