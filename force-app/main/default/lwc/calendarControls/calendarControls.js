// calendarControls.js - Navigation and action buttons
import { LightningElement, api } from "lwc";

export default class CalendarControls extends LightningElement {
  @api currentDate;
  @api showSearch = false;
  @api searchTerm = "";
  @api searchSuggestions = [];

  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  get currentMonthYear() {
    return `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  handlePreviousMonth() {
    this.dispatchEvent(
      new CustomEvent("datenavigation", {
        detail: { action: "previous" }
      })
    );
  }

  handleNextMonth() {
    this.dispatchEvent(
      new CustomEvent("datenavigation", {
        detail: { action: "next" }
      })
    );
  }

  handleGoToToday() {
    this.dispatchEvent(
      new CustomEvent("datenavigation", {
        detail: { action: "today" }
      })
    );
  }

  handleEditClick() {
    const today = new Date().toISOString().split("T")[0];
    this.dispatchEvent(
      new CustomEvent("editclick", {
        detail: { date: today }
      })
    );
  }

  handleAddEventClick() {
    this.dispatchEvent(new CustomEvent("addeventclick"));
  }

  handleToggleSearch() {
    this.dispatchEvent(new CustomEvent("searchtoggle"));
  }

  handleSearchChange(event) {
    this.dispatchEvent(
      new CustomEvent("searchchange", {
        detail: { searchTerm: event.target.value }
      })
    );
  }

  handleSearchInput(event) {
    this.dispatchEvent(
      new CustomEvent("searchchange", {
        detail: { searchTerm: event.target.value }
      })
    );
  }

  handleSuggestionClick(event) {
    const eventId = event.currentTarget.dataset.eventId;
    this.dispatchEvent(
      new CustomEvent("searchsuggestionselect", {
        detail: { eventId }
      })
    );
  }
}
