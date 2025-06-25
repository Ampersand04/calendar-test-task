// calendarDay.js - Individual day cell component
import { LightningElement, api } from "lwc";

export default class CalendarDay extends LightningElement {
  @api dayData;

  get calendarDayClass() {
    let classes = "calendar-day";
    classes += this.dayData.isCurrentMonth ? " current-month" : " other-month";
    if (this.dayData.isSelected) classes += " selected";
    if (this.dayData.hasEvents) classes += " hasEvents";
    return classes;
  }

  get dayNumberClass() {
    if (this.dayData.isToday) return "day-number today";
    return "day-number";
  }

  handleDateClick() {
    this.dispatchEvent(
      new CustomEvent("dateclick", {
        detail: { dateString: this.dayData.dateString },
        bubbles: true
      })
    );
  }

  handleEditEvent(event) {
    event.stopPropagation();
    const eventId = event.target.dataset.eventId;
    this.dispatchEvent(
      new CustomEvent("eventedit", {
        detail: { eventId },
        bubbles: true
      })
    );
  }

  handleDeleteEvent(event) {
    event.stopPropagation();
    const eventId = event.target.dataset.eventId;
    this.dispatchEvent(
      new CustomEvent("eventdelete", {
        detail: { eventId },
        bubbles: true
      })
    );
  }
}
