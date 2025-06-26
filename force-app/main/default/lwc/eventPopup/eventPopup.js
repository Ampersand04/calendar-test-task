import { LightningElement, api, track } from "lwc";

export default class EventPopup extends LightningElement {
  @api show = false;
  @api position = { top: 0, left: 0, arrowPosition: "none" };
  @api eventData = {
    title: "",
    description: "",
    participants: "",
    time: "",
    date: "",
    id: null
  };

  @track formData = {
    title: "",
    description: "",
    participants: "",
    time: "",
    date: ""
  };

  @track hasInitiallyFocused = false;

  connectedCallback() {
    this.updateFormData();
  }

  renderedCallback() {
    if (this.show && !this.hasInitiallyFocused) {
      const titleInput = this.template.querySelector(
        '.popup-input[data-field="title"]'
      );
      if (titleInput) {
        setTimeout(() => {
          titleInput.focus();
          this.hasInitiallyFocused = true;
        }, 150);
      }
    }

    if (!this.show) {
      this.hasInitiallyFocused = false;
    }
  }

  updateFormData() {
    this.formData = { ...this.eventData };
  }

  get popupTitle() {
    return this.eventData.id ? "Edit Event" : "Add Event";
  }

  get saveButtonText() {
    return this.eventData.id ? "Update Event" : "Save Event";
  }

  get popupStyle() {
    return `top: ${this.position.top}px; left: ${this.position.left}px;`;
  }

  get popupArrowClass() {
    const arrowClass =
      this.position.arrowPosition === "right"
        ? "arrow-right"
        : this.position.arrowPosition === "none"
          ? ""
          : "arrow-left";
    return `event-popup ${arrowClass}`;
  }

  get isEditing() {
    return !!this.eventData.id;
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;
    const value = event.target.value;
    this.formData = { ...this.formData, [field]: value };
  }

  handleInputFocus(event) {
    event.stopPropagation();
  }

  handleInputClick(event) {
    event.stopPropagation();
    event.target.focus();
  }

  handleSave() {
    if (!this.formData.title.trim() || !this.formData.date) {
      if (!this.formData.title.trim()) {
        const titleInput = this.template.querySelector(
          '.popup-input[data-field="title"]'
        );
        if (titleInput) titleInput.focus();
      } else if (!this.formData.date) {
        const dateInput = this.template.querySelector(
          '.popup-input[data-field="date"]'
        );
        if (dateInput) dateInput.focus();
      }
      return;
    }

    const eventData = {
      id: this.eventData.id || Date.now().toString(),
      title: this.formData.title,
      description: this.formData.description,
      participants: this.formData.participants,
      time: this.formData.time,
      date: this.formData.date
    };

    this.dispatchEvent(
      new CustomEvent("save", {
        detail: { eventData, isEditing: this.isEditing }
      })
    );
  }

  handleDelete() {
    if (this.eventData.id) {
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: { eventId: this.eventData.id }
        })
      );
    }
  }

  handleClose() {
    this.hasInitiallyFocused = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  handlePopupContentClick(event) {
    event.stopPropagation();
  }

  @api
  updateEventData(eventData) {
    this.eventData = { ...eventData };
    this.updateFormData();

    this.hasInitiallyFocused = false;
  }

  @api
  updatePosition(position) {
    this.position = { ...position };
  }
}
