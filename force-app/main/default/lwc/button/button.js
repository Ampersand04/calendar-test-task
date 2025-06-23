import { LightningElement, api } from "lwc";

export default class Button extends LightningElement {
  @api label;

  handleClick(event) {
    this.dispatchEvent(
      new CustomEvent("click", {
        bubbles: true,
        composed: true
      })
    );
  }
}
