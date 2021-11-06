class AutoComplete {
  constructor(interaction) {
    this.interaction = interaction;
    this.options = [];
  }

  addOptions(...options) {
    for (const option of options) {
      this.options.push(option);
    }
    return this
  }

  callback(data = { data: {} }) {
    if (typeof data == 'object') {
      if (data?.data?.options == undefined) {
        data.data.choices = this.options;
      }
      if (data?.type == undefined) {
        data.type = 8;
      }
    }
    return this.interaction.client.callbackInteraction(this.interaction.id, this.interaction.token, data);
  }
}


module.exports = AutoComplete;
