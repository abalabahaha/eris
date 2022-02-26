class AutoComplete {
  constructor(interaction) {
    this.interaction = interaction;
    this.options = [];
  }

  addOptions(...data) {
    const a = (b) => {
      for (const option of b) {
        if (Array.isArray(option)) {
        } else {
          this.options.push(option);
        }
      }
    };
    for (const c of data) {
      if (Array.isArray(c)) {
        a(c);
      } else {
        this.options.push(c);
      }
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
