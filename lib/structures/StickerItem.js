class StickerItem {
  constructor(data) {
    this.id = data.id;
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.asset !== undefined) {
      /**
       * @deprecated
       * @reason previously the sticker asset hash, now an empty string
       */
      this.asset = data.asset;
    }
    if (data.pack_id !== undefined) {
      this.packID = data.pack_id;
    }
    if (data.tags !== undefined) {
      this.tags = data.tags;
    }

    if (data.type !== undefined) {
      /**
       * Type of sticker
       *
        | Type     | Value | Description                                                                   |
        | -------- | ----- | ----------------------------------------------------------------------------- |
        | STANDARD | 1     | an official sticker in a pack, part of Nitro or in a removed purchasable pack |
        | GUILD    | 2     | a sticker uploaded to a Boosted guild for the guild's members                 |
      */
      this.type = data.type;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }

    if (data.format_type !== undefined) {
      /**
       * | Type   | Value |
       * | ------ | ----- |
       * | PNG    | 1     |
       * | APNG   | 2     |
       * | LOTTIE | 3     |
       */
      this.formatType = data.format_type;
    }

    if (data.available !== undefined) {
      this.available = data.available;
    }

    if (data.sort_value !== undefined) {
      this.sortValue = data.sort_value;
    }

    if (data.guild_id !== undefined) {
      this.guildID = data.guild_id;
    }
  }


  get stickerAnimateURL() {
    return `https://media.discordapp.net/stickers/${this.id}.png?size=512&passthrough=true`;
  }

  get stickerURL() {
    return `https://media.discordapp.net/stickers/${this.id}.png?size=512&passthrough=false`;
  }
}

module.exports = StickerItem;
