

class ActionRow {
  constructor(data, options) {
    this.type = 1;
    if (options !== undefined) {
      if (options) {
        this.options = [];
      }
    }
    this.components = [];
    if (data?.components !== undefined) {

      this.components = data.components;
    }
  }

  addComponent(...component) {
    component.forEach((a) => this.components.push(a));
    return this;
  }

  get buildComponents() {
    return this.components;
  }

  get buildOptions() {
    return this.options;
  }

  get build() {
    return this;
  }
}
module.exports = ActionRow;
