import { LightningElement, track } from "lwc";

export default class CalendarComponent extends LightningElement {
  @track currentDate = new Date();
  @track selectedDate = null;
  @track events = [];
  @track showEventPopup = false;
  @track showEditPopup = false;
  @track popupPosition = { top: 0, left: 0, arrowPosition: "none" };
  @track editPopupPosition = { top: 0, left: 0 };
  @track activePopupDate = null;
  @track currentEventData = {
    title: "",
    description: "",
    participants: "",
    time: "",
    date: "",
    id: null
  };
  @track searchTerm = "";
  @track searchSuggestions = [];
  @track calendarWeeks = 5;

  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  connectedCallback() {
    this.loadEventsFromStorage();
  }

  handlePreviousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
  }

  handleNextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
  }

  handleGoToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  handleEditClick() {
    this.calculateEditPopupPosition();
    this.showEditPopup = true;

    const editPopup = this.template.querySelector("c-edit-event-popup");
    if (editPopup) {
      editPopup.updatePosition(this.editPopupPosition);
      editPopup.setDate(new Date().toISOString().split("T")[0]);
    }
  }

  handleAddEventClick() {
    const today = new Date();
    this.selectedDate = today;
    this.activePopupDate = today.toISOString().split("T")[0];

    this.currentEventData = {
      title: "",
      description: "",
      participants: "",
      time: "",
      date: this.activePopupDate,
      id: null
    };

    this.calculateCenterPopupPosition();
    this.showEventPopup = true;
    this.updateEventPopup();
  }

  handleSearchChange(event) {
    this.searchTerm = event.detail.searchTerm;
    this.updateSearchSuggestions();
  }

  handleSearchInput(event) {
    this.searchTerm = event.detail.searchTerm;
    this.updateSearchSuggestions();
  }

  handleSearchClear() {
    this.searchTerm = "";
    this.searchSuggestions = [];
  }

  handleSuggestionSelect(event) {
    const selectedEvent = event.detail.data;
    if (selectedEvent) {
      const eventDate = new Date(selectedEvent.date);
      this.currentDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        1
      );
      this.selectedDate = eventDate;
      this.searchTerm = "";
      this.searchSuggestions = [];
    }
  }

  handleEditPopupSubmit(event) {
    const { selectedDate } = event.detail;

    const date = new Date(selectedDate + "T00:00:00");
    this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    this.selectedDate = date;
    this.activePopupDate = selectedDate;

    this.currentEventData = {
      title: "",
      description: "",
      participants: "",
      time: "",
      date: selectedDate,
      id: null
    };

    this.showEditPopup = false;

    setTimeout(() => {
      this.calculateCenterPopupPosition();
      this.showEventPopup = true;
      this.updateEventPopup();
    }, 100);
  }

  handleEditPopupClose() {
    this.showEditPopup = false;
  }

  handleEditPopupEditEvent(event) {
    const { eventData, selectedDate } = event.detail;

    const date = new Date(selectedDate + "T00:00:00");
    this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    this.selectedDate = date;
    this.activePopupDate = selectedDate;
    this.currentEventData = { ...eventData };

    this.showEditPopup = false;

    setTimeout(() => {
      this.calculateCenterPopupPosition();
      this.showEventPopup = true;
      this.updateEventPopup();
    }, 100);
  }

  handleEditPopupDeleteEvent(event) {
    const { eventId } = event.detail;
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveEventsToStorage();

    this.loadEventsFromStorage();
  }

  handleEventPopupSave(event) {
    const { eventData, isEditing } = event.detail;

    if (isEditing) {
      const eventIndex = this.events.findIndex((e) => e.id === eventData.id);
      if (eventIndex !== -1) {
        this.events[eventIndex] = eventData;
      }
    } else {
      this.events.push(eventData);
    }

    this.saveEventsToStorage();
    this.showEventPopup = false;
  }

  handleEventPopupDelete(event) {
    const { eventId } = event.detail;
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveEventsToStorage();
    this.showEventPopup = false;
  }

  handleEventPopupClose(event) {
    const dateString = event?.detail?.dateString;
    if (!dateString) return;

    const clickedDate = new Date(dateString);
    if (
      this.selectedDate &&
      this.selectedDate.toDateString() === clickedDate.toDateString()
    ) {
      this.selectedDate = null;
      this.activePopupDate = null;
      this.showEventPopup = false;
      this.currentEventData = null;
      return;
    }

    this.showEventPopup = false;
  }

  handleDateClick(event) {
    const { dateString, originalEvent } = event.detail;
    if (!dateString) return;

    const clickedDate = new Date(dateString + "T00:00:00");

    if (
      this.selectedDate &&
      this.selectedDate.getTime() === clickedDate.getTime()
    ) {
      this.selectedDate = null;
      this.activePopupDate = null;
      this.showEventPopup = false;
      this.currentEventData = null;
      return;
    }

    this.selectedDate = clickedDate;
    this.activePopupDate = dateString;

    this.currentEventData = {
      title: "",
      description: "",
      participants: "",
      time: "",
      date: dateString,
      id: null
    };

    const targetElement = originalEvent.currentTarget;
    this.calculateSmartPopupPosition(targetElement);
    this.showEventPopup = true;
    this.updateEventPopup();
  }

  handleEditEvent(event) {
    const { eventId, originalEvent } = event.detail;
    const eventToEdit = this.events.find((e) => e.id === eventId);

    if (eventToEdit) {
      this.selectedDate = new Date(eventToEdit.date + "T00:00:00");
      this.activePopupDate = eventToEdit.date;
      this.currentEventData = { ...eventToEdit };

      const targetElement = originalEvent.target.closest(".calendar-day");
      this.calculateSmartPopupPosition(targetElement);
      this.showEventPopup = true;
      this.updateEventPopup();
    }
  }

  handleDeleteEvent(event) {
    const { eventId } = event.detail;
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveEventsToStorage();
  }

  calculateCenterPopupPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 100;

    let top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
    let left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;

    if (top < scrollTop + margin) top = scrollTop + margin;
    if (top + popupHeight > scrollTop + viewportHeight - margin) {
      top = scrollTop + viewportHeight - popupHeight - margin;
    }
    if (left < scrollLeft + margin) left = scrollLeft + margin;
    if (left + popupWidth > scrollLeft + viewportWidth - margin) {
      left = scrollLeft + viewportWidth - popupWidth - margin;
    }

    this.popupPosition = { top, left, arrowPosition: "none" };
  }

  calculateEditPopupPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const popupWidth = 280;
    const popupHeight = 200;
    const margin = 20;

    const editButton = this.template.querySelector(
      "c-calendar-controls .edit-btn"
    );
    let top, left;

    if (editButton && viewportWidth > 768) {
      const rect = editButton.getBoundingClientRect();

      top = rect.bottom + scrollTop + 10;
      left = rect.left + scrollLeft + (rect.width - popupWidth) / 2;

      if (left + popupWidth > viewportWidth - margin) {
        left = viewportWidth - popupWidth - margin + scrollLeft;
      }

      if (left < scrollLeft + margin) {
        left = scrollLeft + margin;
      }

      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        top = rect.top + scrollTop - popupHeight - 10;

        if (top < scrollTop + margin) {
          top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
        }
      }
    } else {
      top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
      left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;
    }

    if (top < scrollTop + margin) {
      top = scrollTop + margin;
    }
    if (top + popupHeight > scrollTop + viewportHeight - margin) {
      top = scrollTop + viewportHeight - popupHeight - margin;
    }
    if (left < scrollLeft + margin) {
      left = scrollLeft + margin;
    }
    if (left + popupWidth > scrollLeft + viewportWidth - margin) {
      left = scrollLeft + viewportWidth - popupWidth - margin;
    }

    this.editPopupPosition = { top, left };
  }

  calculateSmartPopupPosition(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 100;

    let top, left, arrowPosition;

    if (viewportWidth <= 768) {
      top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
      left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;
      arrowPosition = "none";
    } else {
      const rightPos = rect.right + scrollLeft + 10;
      const leftPos = rect.left + scrollLeft - popupWidth - 10;

      const canPlaceRight =
        rightPos + popupWidth <= scrollLeft + viewportWidth - margin;
      const canPlaceLeft = leftPos >= scrollLeft + margin;

      if (canPlaceRight) {
        left = rightPos;
        arrowPosition = "left";
      } else if (canPlaceLeft) {
        left = leftPos;
        arrowPosition = "right";
      } else {
        left = rightPos;
        arrowPosition = "left";
      }

      top = rect.top + scrollTop + rect.height / 2 - popupHeight / 2;
    }

    if (top < scrollTop + margin) top = scrollTop + margin;
    if (top + popupHeight > scrollTop + viewportHeight - margin) {
      top = scrollTop + viewportHeight - popupHeight - margin;
    }
    if (left < scrollLeft + margin) left = scrollLeft + margin;
    if (left + popupWidth > scrollLeft + viewportWidth - margin) {
      left = scrollLeft + viewportWidth - popupWidth - margin;
    }

    this.popupPosition = { top, left, arrowPosition };
  }

  updateEventPopup() {
    const eventPopup = this.template.querySelector("c-event-popup");
    if (eventPopup) {
      eventPopup.updateEventData(this.currentEventData);
      eventPopup.updatePosition(this.popupPosition);
    }
  }

  updateSearchSuggestions() {
    // if (!this.searchTerm.trim()) {
    //   this.searchSuggestions = [];
    //   return;
    // }

    const searchLower = this.searchTerm.toLowerCase();
    this.searchSuggestions = this.events
      .filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((event) => ({
        ...event,
        formattedDate: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }));
  }

  get filteredEvents() {
    if (!this.searchTerm) return this.events;
    return this.events.filter(
      (event) =>
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  saveEventsToStorage() {
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      }
    } catch (error) {
      console.error("Error saving events:", error);
    }
  }

  loadEventsFromStorage() {
    try {
      if (typeof Storage !== "undefined") {
        const savedEvents = localStorage.getItem("calendarEvents");
        if (savedEvents) {
          this.events = JSON.parse(savedEvents);
        }
      }
    } catch (error) {
      console.error("Error loading events:", error);
      this.events = [];
    }
  }

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
    this.calendarWeeks = weeksNeeded;

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < weeksNeeded * 7; i++) {
      const dayEvents = this.searchTerm
        ? this.filteredEvents.filter((event) =>
            this.isSameDate(new Date(event.date), currentDateObj)
          )
        : this.events.filter((event) =>
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
        hasEvents: dayEvents.length > 0,
        calendarDayClass: this.getCalendarDayClass({
          isCurrentMonth: currentDateObj.getMonth() === month,
          isToday: this.isSameDate(currentDateObj, new Date()),
          hasEvents: dayEvents.length > 0,
          isSelected:
            this.selectedDate &&
            this.isSameDate(currentDateObj, this.selectedDate)
        }),
        dayNumberClass: this.getDayNumberClass({
          isToday: this.isSameDate(currentDateObj, new Date()),
          isSelected:
            this.selectedDate &&
            this.isSameDate(currentDateObj, this.selectedDate)
        }),
        weekIndex: Math.floor(i / 7),
        dayIndex: i % 7
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
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

  getCalendarDayClass(dayObj) {
    let classes = "calendar-day";
    classes += dayObj.isCurrentMonth ? " current-month" : " other-month";
    if (dayObj.isSelected) classes += " selected";
    if (dayObj.hasEvents) classes += " hasEvents";
    return classes;
  }

  getDayNumberClass(dayObj) {
    if (dayObj.isToday) return "day-number today";
    return "day-number";
  }
}
