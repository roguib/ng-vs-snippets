import { Component, Input } from "@angular/core";

@Component({
  selector: "app-main",
  templateUrl: "./app.main.component.html",
})
export class MainComponent {
  foo = false;
  @Input() appName: MediaModel;
  @Input() foo: TypeError;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  @Output() fooVar: EventEmitter<number> = new EventEmitter();

  someRandomFunction(action) {
    action = "action";
  }
}
