import { Input } from "@angular/core";
@Component({
  selector: "app-main",
  templateUrl: "./app.main.component.html",
})
export class BaseComponent {
  @Input() baseInput: "type1" | "type2" | "type3";
}
