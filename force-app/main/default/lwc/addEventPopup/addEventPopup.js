import { LightningElement, api, track } from "lwc";

export default class AddEventPopup extends LightningElement {
  @api date;
  @track eventData = {
    title: "",
    dateTime: "",
    participants: "",
    description: ""
  };

  get defaultDateTime() {
    return this.date + "T00:00";
  }

  handleChange(event) {
    const field = event.target.dataset.field;
    this.eventData[field] = event.target.value;
  }

  cancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  save() {
    const newEvent = {
      ...this.eventData,
      id: new Date().getTime().toString(),
      dateTime: this.eventData.dateTime || this.defaultDateTime
    };
    this.dispatchEvent(new CustomEvent("save", { detail: newEvent }));
  }
}
