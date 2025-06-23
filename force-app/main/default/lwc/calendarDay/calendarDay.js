import { LightningElement, api } from "lwc";

export default class CalendarDay extends LightningElement {
  @api dayData;

  get cssClass() {
    return this.dayData?.other ? "day-cell other" : "day-cell";
  }
}
