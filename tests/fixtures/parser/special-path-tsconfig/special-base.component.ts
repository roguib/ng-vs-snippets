import { Input } from "@angular/core";

export class SpecialBaseComponent {
  @Input() baseInputInSpecialBaseClass: "type1" | "type2" | "type3";
}
