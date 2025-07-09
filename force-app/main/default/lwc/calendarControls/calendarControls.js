import { LightningElement, api, track } from "lwc";

export default class CalendarControls extends LightningElement {
  @api currentDate;
  @api showEditButton = false;
  @api showAddButton = false;
  @api editButtonLabel = "Edit";
  @api addButtonLabel = "Add event";
  @api searchPlaceholder = "Search";
  @api searchSuggestions = [];
  @api hasCustomActions = false;

  @track isFocused = false;
  @track searchTerm = "";

  @track isSelectingSuggestion = false;
  @track blurTimeout = null;

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

  handleSearchFocus() {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
    this.isFocused = true;
  }

  handleSearchBlur() {
    if (!this.isSelectingSuggestion) {
      this.blurTimeout = setTimeout(() => {
        this.isFocused = false;
      }, 150);
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

  handleSearchClear() {
    this.searchTerm = "";
    this.isFocused = false;
    this.dispatchSearchEvent("searchclear", "");
  }

  handleSuggestionMouseLeave() {
    this.isSelectingSuggestion = false;
  }

  handleSuggestionClick(event) {
    event.preventDefault();
    event.stopPropagation();

    this.isSelectingSuggestion = true;

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    const suggestionId = event.currentTarget.dataset.suggestionId;
    const selectedSuggestion = this.searchSuggestions.find(
      (suggestion) => suggestion.id === suggestionId
    );

    if (selectedSuggestion) {
      this.processSuggestionSelection(selectedSuggestion);
    }
  }

  processSuggestionSelection(selectedSuggestion) {
    this.searchTerm = "";
    this.isFocused = false;
    this.isSelectingSuggestion = false;

    this.dispatchSearchEvent("suggestionselect", selectedSuggestion);

    const searchInput = this.template.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = "";
    }
  }

  handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      this.cancelSearch();
    }
  }

  cancelSearch() {
    this.searchTerm = "";
    this.isFocused = false;
    this.isSelectingSuggestion = false;

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    const searchInput = this.template.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = "";
      searchInput.blur();
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
    this.cancelSearch();
  }

  @api
  setSearchTerm(term) {
    this.searchTerm = term;
    const searchInput = this.template.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = term;
    }
  }

  disconnectedCallback() {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }
}
