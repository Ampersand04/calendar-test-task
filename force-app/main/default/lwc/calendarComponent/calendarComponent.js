import { LightningElement, track } from "lwc";

export default class CalendarComponent extends LightningElement {
  @track currentDate = new Date();
  @track selectedDate = null;
  @track events = [];
  @track showEventPopup = false;
  @track showEditPopup = false;
  @track popupPosition = { top: 0, left: 0 };
  @track editPopupPosition = { top: 0, left: 0 };
  @track activePopupDate = null;
  @track eventTitle = "";
  @track eventDescription = "";
  @track eventParticipants = "";
  @track eventTime = "";
  @track eventDate = "";
  @track editDate = "";
  @track editingEventId = null;
  @track searchTerm = "";
  @track showSearch = false;
  @track searchSuggestions = [];
  @track calendarWeeks = 5;

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

  handleEditClick() {
    this.calculateEditPopupPosition();
    this.editDate = new Date().toISOString().split("T")[0];
    this.showEditPopup = true;
  }

  handleAddEventClick() {
    const today = new Date();
    this.selectedDate = today;
    this.activePopupDate = today.toISOString().split("T")[0];
    this.eventDate = this.activePopupDate;

    this.calculateCenterPopupPosition();
    this.showEventPopup = true;
    this.resetEventForm();
  }

  calculateCenterPopupPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 20;

    let top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
    let left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;

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

    const editButton = this.template.querySelector(".edit-btn");
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

  calculateEditPopupPosition() {
    const viewportWidth = window.innerWidth;
    const popupWidth = 280;

    const editButton = this.template.querySelector(".edit-btn");
    if (editButton) {
      const rect = editButton.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      const top = rect.bottom + scrollTop + 10;
      const left = rect.left + (rect.width - popupWidth) / 2;

      this.editPopupPosition = { top, left };
    } else {
      const top = 100 + window.pageYOffset;
      const left = (viewportWidth - popupWidth) / 2;
      this.editPopupPosition = { top, left };
    }
  }

  handleEditDateChange(event) {
    this.editDate = event.target.value;
  }

  handleSubmitEdit() {
    if (!this.editDate) return;

    const selectedDate = new Date(this.editDate + "T00:00:00");
    this.currentDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    this.selectedDate = selectedDate;
    this.activePopupDate = this.editDate;
    this.eventDate = this.editDate;

    this.showEditPopup = false;

    setTimeout(() => {
      this.calculateCenterPopupPosition();
      this.showEventPopup = true;
      this.resetEventForm();
    }, 100);
  }

  handleCloseEditPopup() {
    this.showEditPopup = false;
    this.editDate = "";
  }

  get editPopupStyle() {
    return `top: ${this.editPopupPosition.top}px; left: ${this.editPopupPosition.left}px;`;
  }

  get currentMonthYear() {
    return `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  handleGoToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  handleToggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchTerm = "";
      this.searchSuggestions = [];
    }
  }

  handleSearchChange(event) {
    this.searchTerm = event.target.value;
    this.updateSearchSuggestions();
  }

  handleSearchInput(event) {
    this.searchTerm = event.target.value;
    this.updateSearchSuggestions();
  }

  updateSearchSuggestions() {
    if (!this.searchTerm.trim()) {
      this.searchSuggestions = [];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.searchSuggestions = this.events
      .filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      )
      .map((event) => ({
        ...event,
        formattedDate: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }))
      .slice(0, 5);
  }

  handleSuggestionClick(event) {
    const eventId = event.currentTarget.dataset.eventId;
    const selectedEvent = this.events.find((e) => e.id === eventId);

    if (selectedEvent) {
      const eventDate = new Date(selectedEvent.date);

      this.currentDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        1
      );

      this.selectedDate = eventDate;

      this.showSearch = false;
      this.searchTerm = "";
      this.searchSuggestions = [];
    }
  }

  get filteredEvents() {
    if (!this.searchTerm) return this.events;
    return this.events.filter(
      (event) =>
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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

  get calendarGridStyle() {
    return `--calendar-rows: ${this.calendarWeeks};`;
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

  handleDateClick(event) {
    const dateString = event.currentTarget.dataset.date;
    if (!dateString) return;

    const clickedDate = new Date(dateString + "T00:00:00");

    this.selectedDate = clickedDate;
    this.activePopupDate = dateString;
    this.eventDate = dateString;

    this.calculateSmartPopupPosition(event.currentTarget);
    this.showEventPopup = true;
    this.resetEventForm();
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
    const margin = 70;

    let top, left, arrowPosition;

    if (viewportWidth <= 768) {
      top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
      left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;
      arrowPosition = "none";

      if (top < scrollTop + margin) top = scrollTop + margin;
      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        top = scrollTop + viewportHeight - popupHeight - margin;
      }
      if (left < scrollLeft + margin) left = scrollLeft + margin;
      if (left + popupWidth > scrollLeft + viewportWidth - margin) {
        left = scrollLeft + viewportWidth - popupWidth - margin;
      }
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
        const spaceRight =
          scrollLeft + viewportWidth - margin - (rightPos + popupWidth);
        const spaceLeft = leftPos - (scrollLeft + margin);

        if (spaceRight >= spaceLeft) {
          left = rightPos;
          arrowPosition = "left";
        } else {
          left = leftPos;
          arrowPosition = "right";
        }
      }

      top = rect.top + scrollTop + rect.height / 2 - popupHeight / 2;
      if (top < scrollTop + margin) top = scrollTop + margin;
      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        top = scrollTop + viewportHeight - popupHeight - margin;
      }

      if (left < scrollLeft + margin) {
        left = scrollLeft + margin;
      }
      if (left + popupWidth > scrollLeft + viewportWidth - margin) {
        left = scrollLeft + viewportWidth - popupWidth - margin;
      }
    }

    this.popupPosition = { top, left, arrowPosition };
  }

  handleClosePopup() {
    this.showEventPopup = false;
    this.resetEventForm();
  }

  handlePopupContentClick(event) {
    event.stopPropagation();
  }

  handleEventTitleChange(event) {
    this.eventTitle = event.target.value;
  }

  handleEventDescriptionChange(event) {
    this.eventDescription = event.target.value;
  }

  handleEventParticipantsChange(event) {
    this.eventParticipants = event.target.value;
  }

  handleEventTimeChange(event) {
    this.eventTime = event.target.value;
  }

  handleEventDateChange(event) {
    this.eventDate = event.target.value;
  }

  handleSaveEvent() {
    if (!this.eventTitle.trim() || !this.eventDate) {
      return;
    }

    const eventData = {
      id: this.editingEventId || Date.now().toString(),
      title: this.eventTitle,
      description: this.eventDescription,
      participants: this.eventParticipants,
      time: this.eventTime,
      date: this.eventDate
    };

    if (this.editingEventId) {
      const eventIndex = this.events.findIndex(
        (e) => e.id === this.editingEventId
      );
      if (eventIndex !== -1) {
        this.events[eventIndex] = eventData;
      }
    } else {
      this.events.push(eventData);
    }

    this.saveEventsToStorage();
    this.handleClosePopup();
  }

  handleEditEvent(event) {
    event.stopPropagation();
    const eventId = event.target.dataset.eventId;
    const eventToEdit = this.events.find((e) => e.id === eventId);

    if (eventToEdit) {
      this.selectedDate = new Date(eventToEdit.date + "T00:00:00");
      this.activePopupDate = eventToEdit.date;
      this.eventTitle = eventToEdit.title;
      this.eventParticipants = eventToEdit.participants;
      this.eventDescription = eventToEdit.description;
      this.eventTime = eventToEdit.time;
      this.eventDate = eventToEdit.date;
      this.editingEventId = eventId;

      this.calculateSmartPopupPosition(event.target.closest(".calendar-day"));
      this.showEventPopup = true;
    }
  }

  handleDeleteEvent(event) {
    event.stopPropagation();
    const eventId = event.target.dataset.eventId;
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveEventsToStorage();
  }

  handleDeleteCurrentEvent() {
    if (this.editingEventId) {
      this.events = this.events.filter((e) => e.id !== this.editingEventId);
      this.saveEventsToStorage();
      this.handleClosePopup();
    }
  }

  resetEventForm() {
    this.eventTitle = "";
    this.eventParticipants = "";
    this.eventDescription = "";
    this.eventTime = "";
    this.eventDate = this.activePopupDate || "";
    this.editingEventId = null;
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

  get popupTitle() {
    return this.editingEventId ? "Edit Event" : "Add Event";
  }

  get saveButtonText() {
    return this.editingEventId ? "Update Event" : "Save Event";
  }

  get selectedDateFormatted() {
    if (!this.selectedDate) return "";
    return this.selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
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

  get popupStyle() {
    return `top: ${this.popupPosition.top}px; left: ${this.popupPosition.left}px;`;
  }

  get popupArrowClass() {
    const arrowClass =
      this.popupPosition.arrowPosition === "right"
        ? "arrow-right"
        : this.popupPosition.arrowPosition === "none"
          ? ""
          : "arrow-left";
    return `event-popup ${arrowClass}`;
  }
}
