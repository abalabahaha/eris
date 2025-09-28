"use strict";

const Base = require("./Base");

/**
 * Represents an attachment
 * @prop {String?} contentType The attachment's media type
 * @prop {String?} description The description for the file (max 1024 characters)
 * @prop {Number?} durationSeconds The duration of the audio file (currently for voice messages)
 * @prop {Boolean?} ephemeral Whether the attachment is ephemeral
 * @prop {String} filename The name of file attached
 * @prop {Number?} flags The attachment flags combined as a bitfield
 * @prop {Number?} height The height of file (if image)
 * @prop {String} id The attachment ID
 * @prop {String} proxyURL The proxy URL of the attachment
 * @prop {Number} size The size of the file in bytes
 * @prop {String?} title The title  of the file
 * @prop {String} url The source URL of the file
 * @prop {String?} waveform The base64 encoded bytearray representing a sampled waveform (currently for voice messages)
 * @prop {Number?} width The width of file (if image)
 */
class Attachment extends Base {
  constructor(data) {
    super(data.id);

    this.filename = data.filename;
    this.proxyURL = data.proxy_url;
    this.size = data.size;
    this.url = data.url;

    if (data.content_type !== undefined) {
      this.contentType = data.content_type;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.duration_secs !== undefined) {
      this.durationSeconds = data.duration_secs;
    }
    if (data.ephemeral !== undefined) {
      this.ephemeral = data.ephemeral;
    }
    if (data.flags !== undefined) {
      this.flags = data.flags;
    }
    if (data.height !== undefined) {
      this.height = data.height;
    }
    if (data.title !== undefined) {
      this.title = data.title;
    }
    if (data.waveform !== undefined) {
      this.waveform = data.waveform;
    }
    if (data.width !== undefined) {
      this.width = data.width;
    }
  }

  toJSON(props = []) {
    return super.toJSON([
      "contentType",
      "description",
      "durationSeconds",
      "ephemeral",
      "filename",
      "flags",
      "height",
      "proxyURL",
      "size",
      "title",
      "url",
      "waveform",
      "width",
      ...props,
    ]);
  }
}

module.exports = Attachment;
