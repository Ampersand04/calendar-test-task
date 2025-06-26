import { LightningElement, api, track } from "lwc";

export default class CalendarControls extends LightningElement {
  @api currentDate;
  @api showEditButton = false;
  @api showAddButton = false;
  @api enableSearch = false;
  @api editButtonLabel = "Edit";
  @api addButtonLabel = "Add event";
  @api searchPlaceholder = "Search";
  @api searchSuggestions = [];
  @api hasCustomActions = false;

  @track showSearchInput = false;
  @track searchTerm = "";

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

  get displayMonthYear() {
    if (!this.currentDate) return "";
    const date = new Date(this.currentDate);
    return `${this.months[date.getMonth()]} ${date.getFullYear()}`;
  }

  handlePreviousMonth() {
    this.dispatchNavigationEvent("previousmonth");
  }

  handleNextMonth() {
    this.dispatchNavigationEvent("nextmonth");
  }

  handleGoToToday() {
    this.dispatchNavigationEvent("gotoday");
  }

  handleEditClick() {
    this.dispatchCustomEvent("editclick");
  }

  handleAddEventClick() {
    this.dispatchCustomEvent("addeventclick");
  }

  handleToggleSearch() {
    this.showSearchInput = !this.showSearchInput;
    if (!this.showSearchInput) {
      this.searchTerm = "";
      this.dispatchSearchEvent("searchclear", "");
    }
  }

  handleSearchChange(event) {
    this.searchTerm = event.target.value;
    this.dispatchSearchEvent("searchchange", this.searchTerm);
  }

  handleSearchInput(event) {
    this.searchTerm = event.target.value;
    this.dispatchSearchEvent("searchinput", this.searchTerm);
  }

  handleSuggestionClick(event) {
    const suggestionId = event.currentTarget.dataset.suggestionId;
    const selectedSuggestion = this.searchSuggestions.find(
      (suggestion) => suggestion.id === suggestionId
    );

    if (selectedSuggestion) {
      this.showSearchInput = false;
      this.searchTerm = "";
      this.dispatchSearchEvent("suggestionselect", selectedSuggestion);
    }
  }

  dispatchNavigationEvent(eventName) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          currentDate: this.currentDate
        }
      })
    );
  }

  dispatchCustomEvent(eventName) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          currentDate: this.currentDate
        }
      })
    );
  }

  dispatchSearchEvent(eventName, data) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          searchTerm: this.searchTerm,
          data: data
        }
      })
    );
  }

  @api
  clearSearch() {
    this.searchTerm = "";
    this.showSearchInput = false;
  }

  @api
  setSearchTerm(term) {
    this.searchTerm = term;
  }
}
