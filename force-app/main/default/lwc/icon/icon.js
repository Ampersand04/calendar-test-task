import { LightningElement, api } from "lwc";
import editIcon from "./templates/editIcon.html";
import addIcon from "./templates/addIcon.html";
import leftNavIcon from "./templates/leftNavIcon.html";
import rightNavIcon from "./templates/rightNavIcon.html";
import crossTemplate from "./templates/cross.html";
import searchTemplate from "./templates/search.html";

export default class Icon extends LightningElement {
  @api type;

  render() {
    switch (this.type) {
      case "edit-icon":
        return editIcon;
      case "add-icon":
        return addIcon;
      case "left-nav-icon":
        return leftNavIcon;
      case "right-nav-icon":
        return rightNavIcon;
      case "search":
        return searchTemplate;
      case "cross":
        return crossTemplate;
      default:
        return super.render();
    }
  }
}
