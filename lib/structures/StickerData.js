class StickerData {
  constructor() {
    this.IsJSON = false;
    this.name = '';
    this.description = '';
    this.tags = '';
    this.file = null;
  }
  /**
     * @returns {{file: null, name: string, description: string, tags: string}}
     */
  buildBlock() {
    return {
      name: this.name,
      description: this.description,
      tags: this.tags,
      file: this.file
    };
  }
  /**
     *
     * @param description
     * @returns {StickerData}
     */
  setDescription(description) {
    this.description = description;
    return this;
  }
  /**
     * @param file
     * @returns {StickerData}
     */
  setFileBuffer(file) {
    this.file = file;
    return this;
  }
  /**
     * @deprecated Discord changed some things, now it's not possible to send in JSON.
     * @param json
     * @returns {StickerData}
     */
  setFileJSON(json) {
    this.file = json;
    return this;
  }

  /**
     *
     * @param name
     * @returns {StickerData}
     */
  setName(name) {
    this.name = name;
    return this;
  }

  /**
     *
     * @param reason
     * @returns {StickerData}
     */
  setReason(reason) {
    this.reason = reason;
    return this;
  }
}

module.exports = StickerData;
