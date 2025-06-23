import { LightningElement, api } from "lwc";

export default class CalendarControls extends LightningElement {
  @api currentMonth;
  @api currentYear;

  get monthLabel() {
    return new Date(this.currentYear, this.currentMonth).toLocaleString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );
  }

  handlePrev() {
    this.dispatchEvent(new CustomEvent("prevmonth"));
  }

  handleNext() {
    this.dispatchEvent(new CustomEvent("nextmonth"));
  }

  handleToday() {
    this.dispatchEvent(new CustomEvent("today"));
  }

  handleSearch(event) {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: { term: event.target.value }
      })
    );
  }

  handleAdd() {
    this.dispatchEvent(new CustomEvent("addeventclick"));
  }
}
