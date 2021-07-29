

class Options {
  constructor(data) {
    if (data?.label !== undefined) {
      this.label = data.label;
    }

    if (data?.value !== undefined) {
      this.value = data.value;
    }

    if (data?.description !== undefined) {
      this.description = data.description;
    }
    if (data?.emoji !== undefined) {
      if (data?.emoji?.name !== undefined) {
        this.emoji.id = data.emoji.id;
      }

      this.emoji = {  };
      if (data?.emoji?.name !== undefined) {
        this.emoji.name = data.emoji.name;
      }

      if (data?.emoji?.name !== undefined) {
        this.emoji.id = data.emoji.id;
      }
    }

    if (data?.default !== undefined) {
      this.default = data.default;
    }


  }

  setDefault(booleanDefault) {
    this.default = booleanDefault;
    return this;
  }
  setDescription(description) {
    this.description = description;
    return this;
  }
  setEmoji(emojiData = {}) {
    this.emoji = emojiData;
    return this;
  }
  setLabel(label) {
    this.label = label;
    return this;
  }


  setValue(value) {
    this.value = value;
    return this;
  }







}

module.exports = Options;
