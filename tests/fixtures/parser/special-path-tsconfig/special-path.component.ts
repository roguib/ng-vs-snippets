import { Component, Input } from "@angular/core";
import { SpecialBaseComponent } from "@special-base/special-base.component";

@Component({
  selector: "app-main",
  templateUrl: "./app.main.component.html",
})
export class SpecialPathComponent extends SpecialBaseComponent {
  @Input() inputInChildClass: "type1" | "type2" | "type3";
}
