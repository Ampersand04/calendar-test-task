// calendarComponent.js - Updated sections for dynamic grid
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
  @track eventTime = "";
  @track eventDate = "";
  @track editDate = "";
  @track editingEventId = null;
  @track searchTerm = "";
  @track showSearch = false;
  @track searchSuggestions = [];
  @track calendarWeeks = 5; // Track number of weeks dynamically

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

  // Fixed weekdays - corrected typos
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

  // Header Edit Button Handler
  handleEditClick() {
    // Position edit popup in the center-top area
    this.calculateEditPopupPosition();
    this.editDate = new Date().toISOString().split("T")[0]; // Default to today
    this.showEditPopup = true;
  }

  // Header Add Event Button Handler
  handleAddEventClick() {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today;
    this.activePopupDate = today.toISOString().split("T")[0];
    this.eventDate = this.activePopupDate;

    // Position popup in center of screen
    this.calculateCenterPopupPosition();
    this.showEventPopup = true;
    this.resetEventForm();
  }

  // Calculate center popup position for header add event
  calculateCenterPopupPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 20;

    // Always center the popup when opened from header
    let top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
    let left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;

    // Ensure popup stays within viewport bounds
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

  // Updated calculateEditPopupPosition for header edit button
  calculateEditPopupPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    const popupWidth = 280;
    const popupHeight = 200; // Edit popup is smaller
    const margin = 20;

    // Try to position below the edit button
    const editButton = this.template.querySelector(".edit-btn");
    let top, left;

    if (editButton && viewportWidth > 768) {
      const rect = editButton.getBoundingClientRect();

      // Position below the button
      top = rect.bottom + scrollTop + 10;
      left = rect.left + scrollLeft + (rect.width - popupWidth) / 2;

      // Check if popup goes off right edge
      if (left + popupWidth > viewportWidth - margin) {
        left = viewportWidth - popupWidth - margin + scrollLeft;
      }

      // Check if popup goes off left edge
      if (left < scrollLeft + margin) {
        left = scrollLeft + margin;
      }

      // Check if popup goes off bottom edge
      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        // Position above the button instead
        top = rect.top + scrollTop - popupHeight - 10;

        // If still off screen, center vertically
        if (top < scrollTop + margin) {
          top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
        }
      }
    } else {
      // Fallback to center positioning for mobile or if button not found
      top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
      left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;
    }

    // Final boundary checks
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

  // Calculate edit popup position
  calculateEditPopupPosition() {
    const viewportWidth = window.innerWidth;
    const popupWidth = 280;

    // Position below the edit button
    const editButton = this.template.querySelector(".edit-btn");
    if (editButton) {
      const rect = editButton.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      const top = rect.bottom + scrollTop + 10;
      const left = rect.left + (rect.width - popupWidth) / 2;

      this.editPopupPosition = { top, left };
    } else {
      // Fallback to center-top
      const top = 100 + window.pageYOffset;
      const left = (viewportWidth - popupWidth) / 2;
      this.editPopupPosition = { top, left };
    }
  }

  // Edit popup handlers
  handleEditDateChange(event) {
    this.editDate = event.target.value;
  }

  handleSubmitEdit() {
    if (!this.editDate) return;

    // Navigate to the selected date and open event popup
    const selectedDate = new Date(this.editDate + "T00:00:00");
    this.currentDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    this.selectedDate = selectedDate;
    this.activePopupDate = this.editDate;
    this.eventDate = this.editDate;

    // Close edit popup and open event popup
    this.showEditPopup = false;

    // Small delay to ensure calendar is rendered with new date
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
      .slice(0, 5); // Limit to 5 suggestions
  }

  handleSuggestionClick(event) {
    const eventId = event.currentTarget.dataset.eventId;
    const selectedEvent = this.events.find((e) => e.id === eventId);

    if (selectedEvent) {
      const eventDate = new Date(selectedEvent.date);

      // Navigate to the event's month and year
      this.currentDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        1
      );

      // Select the event's date
      this.selectedDate = eventDate;

      // Clear search
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

  // UPDATED: More precise dynamic calendar grid calculation
  get calendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for first day (0=Sunday, 1=Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Convert to Monday-start (Monday=0, Sunday=6)
    const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Calculate start date (beginning of the week containing first day)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - mondayBasedFirstDay);

    // Get the day of week for last day
    const lastDayOfWeek = lastDay.getDay();
    const mondayBasedLastDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;

    // Calculate end date (end of the week containing last day)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - mondayBasedLastDay));

    // Calculate total days needed
    const totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Determine number of weeks (5 or 6)
    const weeksNeeded = Math.ceil(totalDays / 7);
    this.calendarWeeks = weeksNeeded;

    const days = [];
    const currentDateObj = new Date(startDate);

    // Generate exact number of days needed
    for (let i = 0; i < weeksNeeded * 7; i++) {
      const dayEvents = this.searchTerm
        ? this.filteredEvents.filter((event) =>
            this.isSameDate(new Date(event.date), currentDateObj)
          )
        : this.events.filter((event) =>
            this.isSameDate(new Date(event.date), currentDateObj)
          );

      // Create a properly formatted date string for dataset
      const dateString = this.formatDateForDataset(currentDateObj);

      days.push({
        date: new Date(currentDateObj),
        dateString: dateString, // This will be used in the data-date attribute
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

  // NEW: Get dynamic grid CSS custom property
  get calendarGridStyle() {
    return `--calendar-rows: ${this.calendarWeeks};`;
  }

  // Helper method to format date for dataset attribute
  formatDateForDataset(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Helper method to format time display
  formatTime(timeString) {
    if (!timeString) return null;

    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
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
    // Fix: Parse the date correctly from the dataset
    const dateString = event.currentTarget.dataset.date;
    if (!dateString) return;

    // Parse the date string properly
    const clickedDate = new Date(dateString + "T00:00:00"); // Add time to avoid timezone issues

    this.selectedDate = clickedDate;
    this.activePopupDate = dateString;
    this.eventDate = dateString;

    // Smart popup positioning
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

    // Мобильная версия: всегда центрируем без стрелки
    if (viewportWidth <= 768) {
      top = viewportHeight / 2 - popupHeight / 2 + scrollTop;
      left = viewportWidth / 2 - popupWidth / 2 + scrollLeft;
      arrowPosition = "none";

      // Удерживаем попап в пределах экрана
      if (top < scrollTop + margin) top = scrollTop + margin;
      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        top = scrollTop + viewportHeight - popupHeight - margin;
      }
      if (left < scrollLeft + margin) left = scrollLeft + margin;
      if (left + popupWidth > scrollLeft + viewportWidth - margin) {
        left = scrollLeft + viewportWidth - popupWidth - margin;
      }
    } else {
      // Десктоп: пытаемся вывести справа или слева от ячейки
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
        // Ни там, ни там не помещается целиком – выбираем сторону с большим свободным пространством
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

      // Вертикальное центрирование относительно ячейки
      top = rect.top + scrollTop + rect.height / 2 - popupHeight / 2;
      if (top < scrollTop + margin) top = scrollTop + margin;
      if (top + popupHeight > scrollTop + viewportHeight - margin) {
        top = scrollTop + viewportHeight - popupHeight - margin;
      }

      // Финальные проверки по горизонтали
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
    // Prevent popup from closing when clicking inside
    event.stopPropagation();
  }

  handleEventTitleChange(event) {
    this.eventTitle = event.target.value;
  }

  handleEventDescriptionChange(event) {
    this.eventDescription = event.target.value;
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
      time: this.eventTime,
      date: this.eventDate // Use the actual selected/input date
    };

    if (this.editingEventId) {
      // Update existing event
      const eventIndex = this.events.findIndex(
        (e) => e.id === this.editingEventId
      );
      if (eventIndex !== -1) {
        this.events[eventIndex] = eventData;
      }
    } else {
      // Add new event
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
      this.eventDescription = eventToEdit.description;
      this.eventTime = eventToEdit.time;
      this.eventDate = eventToEdit.date;
      this.editingEventId = eventId;

      // Position popup near the event with smart positioning
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
    this.eventDescription = "";
    this.eventTime = "";
    this.eventDate = this.activePopupDate || "";
    this.editingEventId = null;
  }

  saveEventsToStorage() {
    try {
      // Use in-memory storage instead of localStorage for Claude.ai compatibility
      // In real Salesforce LWC, you would use @wire or Apex methods
      if (typeof Storage !== "undefined") {
        localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      }
    } catch (error) {
      console.error("Error saving events:", error);
    }
  }

  loadEventsFromStorage() {
    try {
      // Use in-memory storage instead of localStorage for Claude.ai compatibility
      // In real Salesforce LWC, you would use @wire or Apex methods
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

  get isDateDisabled() {
    // Disable date input when editing from a specific day click
    return this.activePopupDate && !this.editingEventId;
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
    if (dayObj.isToday) classes += " today";
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
