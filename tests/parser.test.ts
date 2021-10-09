import * as parser from "../src/parser";
const path = require("path");

// TODO: Rewrite the tests so we have:
// 1. For normal inputs
// 2. For complex inputs
// 3. For normal outputs
// 4. For class inheritance

test("Parses the contents of the candidate files and returns an array of File type", async () => {
  process.env.ROOT_PROJECT_PATH = path.join(path.posix.resolve(), "/tests/fixtures/parser");
  const result = [
    {
      componentName: "MainComponent",
      extendedClassFilepath: path.join(path.posix.resolve(), "/tests/fixtures/parser/base.component.ts"),
      filePath: path.join(path.posix.resolve(), "/tests/fixtures/parser/main.component.ts"),
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
      {
        fileData: `import { Input } from \"@angular/core\",
        export class BaseComponent {
          @Input() baseInput: 'type1' | 'type2' | 'type3';
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/base.component.ts"),
        type: "CLASS",
      },
      {
        fileData: `import { CommonModule } from '@angular/common';
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [Component],
          imports: [CommonModule],
          exports: [Component],
        })
        export class ComponentModule {}`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/component.module.ts"),
        type: "CLASS",
      },
      {
        fileData: `import { Component, Input } from \"@angular/core\";
        import { BaseComponent } from \"./base.component\";

        @Component({
          selector: \"app-main\",
          templateUrl: \"./app.main.component.html\",
        })
        export class MainComponent extends BaseComponent {
          foo = false;
          @Input() literalType1: \"type1\" | \"type2\" | \"type3\";
          @Input() literalType2: \"type1\" | \"type2\" | \"type3\" = \"type1\";
          @Input() literal_Type3: \"type1\" | \"type2\" | \"type3\" = \"type1\";
          @Input() appName: MediaModel;
          @Input() foo: TypeError;
          @Input() numberInput: number = 9;
          @Input(\"inputNameA\") varName: type;
          @Input(\"inputNameB\") varName: type;
          @Input(\"inputNameC\") varName = \"adv\";
          @Input(\"inputNameD\") varName = 2354;
          @Input() withoutType;
          @Input() withoutTypeNorSemicolon;
          @Input() variableAssignedValue = 9;
          @Input() variableAssignedValueAndSemicolon = value;
          @Output() buttonClick: EventEmitter<any> = new EventEmitter();
          @Output() fooVar: EventEmitter<number> = new EventEmitter();
          @Input() set Foo(value) {}
          @Input() set FooType(value: string) {}
          @Input() set FooTypeLiteral(value: \"literal1\" | \"literal2\" | \"literal3\") {}

          someRandomFunction(action) {
            action = \"action\";
          }
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/main.component.ts"),
        type: "COMPONENT",
      },
    ])
  ).toStrictEqual(result);
});

test("Tests the parser when the file is imported using the @ special keyword path defined in tsconfig.json", async () => {
  process.env.ROOT_PROJECT_PATH = path.join(path.posix.resolve(), "/tests/fixtures/parser");
  const result = [
    {
      componentName: "SpecialPathComponent",
      extendedClassFilepath: path.join(path.posix.resolve(), "/tests/fixtures/parser/special-path-tsconfig/special-base.component.ts"),
      filePath: path.join(path.posix.resolve(), "/tests/fixtures/parser/special-path-tsconfig/special-path.component.ts"),
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
      {
        fileData: `import { Input } from \"@angular/core\";

        export class SpecialBaseComponent {
          @Input() baseInputInSpecialBaseClass: \"type1\" | \"type2\" | \"type3\";
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/special-path-tsconfig/special-base.component.ts"),
        type: "CLASS",
      },
      {
        fileData: `import { Component, Input } from \"@angular/core\";
        import { SpecialBaseComponent } from \"@special-base/special-base.component\";

        @Component({
          selector: \"app-main\",
          templateUrl: \"./app.main.component.html\",
        })
        export class SpecialPathComponent extends SpecialBaseComponent {
          @Input() inputInChildClass: \"type1\" | \"type2\" | \"type3\";
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/special-path-tsconfig/special-path.component.ts"),
        type: "COMPONENT",
      },
    ])
  ).toStrictEqual(result);
});

test("Tests the parser with a component that contains a non existent import path", async () => {
  process.env.ROOT_PROJECT_PATH = path.join(path.posix.resolve(), "tests/fixtures/parser");
  const result: any = [];
  expect(
    parser.parser([
      {
        fileData: `import { BaseComponent } from "../some/random/import/here/fileWithRandomNameLoremIpsum.component";

        @Component({
          selector: "app-main",
          templateUrl: "./app.main.component.html",
        })
        export class ComponentWithWrongImportPath extends BaseComponent {
          @Input foo: string;
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/wrong-import-path.ts"),
        type: "CLASS",
      },
    ])
  ).toStrictEqual(result);
});

test("Tests the parser with a component that contains an incorrect import path", async () => {
  process.env.ROOT_PROJECT_PATH = path.join(path.posix.resolve(), "tests/fixtures/parser");
  const result: any = [];
  expect(
    parser.parser([
      {
        fileData: `import { BaseComponent } from;

        @Component({
          selector: "app-main",
          templateUrl: "./app.main.component.html",
        })
        export class ComponentWithWrongImportPath extends BaseComponent {
          @Input foo: string;
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/wrong-import-path.ts"),
        type: "CLASS",
      },
    ])
  ).toStrictEqual(result);
});

test("Tests the parser with a component that doesn't contain inputs or outputs but extends a class with input deffinition", async () => {
  process.env.ROOT_PROJECT_PATH = path.join(path.posix.resolve(), "tests/fixtures/parser");
  const result: any = [
    {
      componentName: "noInputsOrOutputsComponent",
      extendedClassFilepath: path.join(path.posix.resolve(), "/tests/fixtures/parser/base.component.ts"),
      filePath: path.join(path.posix.resolve(), "/tests/fixtures/parser/noInputsOrOutputs.component.ts"),
      inputs: [
        {
          inputName: "baseInput",
          type: "'type1'|'type2'|'type3'",
        },
      ],
      outputs: [],
      prefix: "app-main",
    },
  ];
  expect(
    parser.parser([
      {
        fileData: `import { Component, Input } from "@angular/core";
        import { BaseComponent } from "./base.component";

        @Component({
          selector: "app-main",
          templateUrl: "./app.main.component.html",
        })
        export class noInputsOrOutputsComponent extends BaseComponent {}`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/noInputsOrOutputs.component.ts"),
        type: "COMPONENT",
      },
      {
        fileData: `import { Input } from \"@angular/core\",
        export class BaseComponent {
          @Input() baseInput: 'type1' | 'type2' | 'type3';
        }`,
        filePath: path.join(path.posix.resolve(), "tests/fixtures/parser/base.component.ts"),
        type: "CLASS",
      },
    ])
  ).toStrictEqual(result);
});
