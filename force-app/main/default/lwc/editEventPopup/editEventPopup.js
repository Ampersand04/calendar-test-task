import { LightningElement, api, track } from "lwc";

export default class EditEventPopup extends LightningElement {
  @api show = false;
  @api position = { top: 0, left: 0 };

  @track selectedDate = "";
  @track events = [];
  @track showEventsList = false;

  _positionUpdated = false;

  connectedCallback() {
    const today = new Date();
    this.selectedDate = today.toISOString().split("T")[0];
    this.loadEvents();
  }

  renderedCallback() {
    if (this.show && !this._positionUpdated) {
      this.updatePosition();
      this._positionUpdated = true;
    }
  }

  @api
  updatePosition(newPosition) {
    if (newPosition) {
      this.position = newPosition;
    }
    this._updatePopupPosition();
    this._positionUpdated = false;
  }

  @api
  setDate(dateString) {
    if (this.selectedDate !== dateString) {
      this.selectedDate = dateString;
      this.loadEvents();
    }
  }

  _updatePopupPosition() {
    const popup = this.template.querySelector(".event-popup");
    if (popup && this.position) {
      popup.style.top = `${this.position.top}px`;
      popup.style.left = `${this.position.left}px`;
    }
  }

  handleDateChange(event) {
    const newDate = event.target.value;
    if (this.selectedDate !== newDate) {
      this.selectedDate = newDate;
      this.loadEvents();
      this.showEventsList = true;
    }
  }

  handleViewEvents() {
    this.loadEvents();
    this.showEventsList = true;
  }

  handleAddEvent() {
    const submitEvent = new CustomEvent("submit", {
      detail: {
        selectedDate: this.selectedDate
      }
    });
    this.dispatchEvent(submitEvent);
  }

  handleEditEvent(event) {
    const eventId = event.currentTarget.dataset.eventId;
    const eventToEdit = this.events.find((e) => e.id === eventId);
    if (eventToEdit) {
      const editEvent = new CustomEvent("editevent", {
        detail: {
          eventData: eventToEdit,
          selectedDate: this.selectedDate
        }
      });
      this.dispatchEvent(editEvent);
    }
  }

  handleDeleteEvent(event) {
    const eventId = event.currentTarget.dataset.eventId;

    if (confirm("Are you sure you want to delete this event?")) {
      this.events = this.events.filter((e) => e.id !== eventId);

      this.saveEventsToStorage();

      const deleteEvent = new CustomEvent("deleteevent", {
        detail: {
          eventId: eventId
        }
      });
      this.dispatchEvent(deleteEvent);
    }
  }

  handleClose() {
    this._positionUpdated = false;
    const closeEvent = new CustomEvent("close");
    this.dispatchEvent(closeEvent);
  }

  handleBackdropClick(event) {
    if (event.target.classList.contains("popup-backdrop")) {
      this.handleClose();
    }
  }

  loadEvents() {
    if (!this.selectedDate) return;

    try {
      const allEvents = this.loadEventsFromStorage();

      const filteredEvents = allEvents.filter(
        (event) => event.date === this.selectedDate
      );

      if (JSON.stringify(this.events) !== JSON.stringify(filteredEvents)) {
        this.events = filteredEvents;
      }
    } catch (error) {
      console.error("Error loading events:", error);
      this.events = [];
    }
  }

  loadEventsFromStorage() {
    try {
      if (typeof Storage !== "undefined") {
        const savedEvents = localStorage.getItem("calendarEvents");
        return savedEvents ? JSON.parse(savedEvents) : [];
      }
      return [];
    } catch (error) {
      console.error("Error loading events from storage:", error);
      return [];
    }
  }

  saveEventsToStorage() {
    try {
      if (typeof Storage !== "undefined") {
        const allEvents = this.loadEventsFromStorage();

        const otherEvents = allEvents.filter(
          (event) => event.date !== this.selectedDate
        );

        const updatedEvents = [...otherEvents, ...this.events];

        localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
      }
    } catch (error) {
      console.error("Error saving events to storage:", error);
    }
  }

  formatTime(timeString) {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  }

  get formattedDate() {
    if (!this.selectedDate) return "";
    const date = new Date(this.selectedDate + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  get hasEvents() {
    return this.events && this.events.length > 0;
  }
}
