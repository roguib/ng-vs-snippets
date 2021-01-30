import { Component, Input } from "@angular/core";

@Component({
  selector: "app-main",
  templateUrl: "./app.main.component.html",
})
export class MainComponent {
  foo = false;
  @Input() literalType1: 'type1' | 'type2' | 'type3';
  @Input() literalType2: 'type1' | 'type2' | 'type3' = 'type1';
  @Input() appName: MediaModel;
  @Input() foo: TypeError;
  @Input() numberInput: number = 9;
  @Input("inputNameA") varName: type;
  @Input('inputNameB') varName: type;
  @Input('inputNameC') varName = 'adv';
  @Input("inputNameD") varName = 2354;
  @Input() withoutType;
  @Input() withoutTypeNorSemicolon;
  @Input() variableAssignedValue = 9
  @Input() variableAssignedValueAndSemicolon = value;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  @Output() fooVar: EventEmitter<number> = new EventEmitter();

  someRandomFunction(action) {
    action = "action";
  }
}
