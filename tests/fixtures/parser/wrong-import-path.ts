import { BaseComponent } from "../some/random/import/here/fileWithRandomNameLoremIpsum.component";

@Component({
  selector: "app-main",
  templateUrl: "./app.main.component.html",
})
export class ComponentWithWrongImportPath extends BaseComponent {
  @Input foo: string;
}
