import { LightningElement, api, track } from "lwc";

export default class EditEventPopup extends LightningElement {
  @api eventDataOriginal;
  @track localEvent = {};

  renderedCallback() {
    if (Object.keys(this.localEvent).length === 0 && this.eventDataOriginal) {
      this.localEvent = JSON.parse(JSON.stringify(this.eventDataOriginal));
    }
  }

  handleChange(event) {
    const field = event.target.dataset.field;
    if (field) {
      this.localEvent = {
        ...this.localEvent,
        [field]: event.target.value
      };
    }
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  handleDelete() {
    if (this.localEvent.id) {
      this.dispatchEvent(
        new CustomEvent("delete", { detail: { id: this.localEvent.id } })
      );
    }
  }

  handleUpdate() {
    this.dispatchEvent(
      new CustomEvent("update", { detail: { ...this.localEvent } })
    );
  }
}
