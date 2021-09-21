import { Input } from "@angular/core";

export class BaseComponent {
  @Input() baseInput: "type1" | "type2" | "type3";
}
