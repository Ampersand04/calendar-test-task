// calendarGrid.js - Calendar grid container
import { LightningElement, api } from "lwc";

export default class CalendarGrid extends LightningElement {
  @api currentDate;
  @api selectedDate;
  @api events = [];
  @api searchTerm = "";

  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  get calendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - mondayBasedFirstDay);
    const lastDayOfWeek = lastDay.getDay();
    const mondayBasedLastDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - mondayBasedLastDay));
    const totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < weeksNeeded * 7; i++) {
      const dayEvents = this.filteredEvents.filter((event) =>
        this.isSameDate(new Date(event.date), currentDateObj)
      );

      const dateString = this.formatDateForDataset(currentDateObj);

      days.push({
        date: new Date(currentDateObj),
        dateString: dateString,
        day:
          Math.floor(i / 7) === 0
            ? `${this.weekDays[currentDateObj.getDay() === 0 ? 6 : currentDateObj.getDay() - 1]}, ${currentDateObj.getDate()}`
            : currentDateObj.getDate(),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: this.isSameDate(currentDateObj, new Date()),
        isSelected:
          this.selectedDate &&
          this.isSameDate(currentDateObj, this.selectedDate),
        events: dayEvents.map((event) => ({
          ...event,
          time: event.time ? this.formatTime(event.time) : null
        })),
        hasEvents: dayEvents.length > 0
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }

  get calendarGridStyle() {
    const weeksNeeded = Math.ceil(this.calendarDays.length / 7);
    return `--calendar-rows: ${weeksNeeded};`;
  }

  get filteredEvents() {
    if (!this.searchTerm) return this.events;
    return this.events.filter(
      (event) =>
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatDateForDataset(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  formatTime(timeString) {
    if (!timeString) return null;

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

  isSameDate(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  handleDateClick(event) {
    const dateString = event.detail.dateString;
    this.dispatchEvent(
      new CustomEvent("dateselect", {
        detail: { dateString }
      })
    );
  }

  handleEventEdit(event) {
    const eventId = event.detail.eventId;
    this.dispatchEvent(
      new CustomEvent("eventedit", {
        detail: { eventId }
      })
    );
  }

  handleEventDelete(event) {
    const eventId = event.detail.eventId;
    this.dispatchEvent(
      new CustomEvent("eventdelete", {
        detail: { eventId }
      })
    );
  }
}
