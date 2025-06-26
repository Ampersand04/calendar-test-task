import { LightningElement, api } from "lwc";

export default class CalendarGrid extends LightningElement {
  @api calendarDays = [];
  @api calendarWeeks = 5;

  get calendarGridStyle() {
    return `--calendar-rows: ${this.calendarWeeks};`;
  }

  handleDateClick(event) {
    event.stopPropagation();

    const dateString = event.currentTarget.dataset.date;

    if (!dateString) {
      console.error("No date string found on clicked element");
      return;
    }

    this.dispatchEvent(
      new CustomEvent("dateclick", {
        detail: {
          dateString,
          originalEvent: event
        }
      })
    );
  }

  handleEditEvent(event) {
    event.stopPropagation();

    const eventId = event.target.dataset.eventId;

    if (!eventId) {
      console.error("No event ID found on edit button");
      return;
    }

    this.dispatchEvent(
      new CustomEvent("editevent", {
        detail: {
          eventId: eventId,
          originalEvent: event
        }
      })
    );
  }

  handleDeleteEvent(event) {
    event.stopPropagation();

    const eventId = event.target.dataset.eventId;

    if (!eventId) {
      console.error("No event ID found on delete button");
      return;
    }

    this.dispatchEvent(
      new CustomEvent("deleteevent", {
        detail: {
          eventId: eventId,
          originalEvent: event
        }
      })
    );
  }
}
