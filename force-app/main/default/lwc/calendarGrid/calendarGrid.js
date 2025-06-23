import { LightningElement, api } from "lwc";

export default class CalendarGrid extends LightningElement {
  @api days;

  handleClick(event) {
    const date = event.target.dataset.date;
    if (date) {
      this.dispatchEvent(new CustomEvent("dayclick", { detail: { date } }));
    }
  }
}
