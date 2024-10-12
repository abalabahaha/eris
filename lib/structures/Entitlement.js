"use strict";

const Base = require("./Base.js");

/**
 * Represents an entitlement
 * @prop {String} applicationID The ID of the parent application
 * @prop {Boolean} consumed For consumable items, whether or not the entitlement has been consumed
 * @prop {Boolean} deleted Whether or not the entitlement was deleted
 * @prop {Number?} endsAt The date at which the entitlement is no longer valid. Not present when using test entitlements
 * @prop {String?} guildID The ID of the guild that is granted access to the entitlement's sku
 * @prop {String} skuID The ID of the SKU
 * @prop {Number?} startsAt The start date at which the entitlement is valid. Not present when using test entitlements
 * @prop {Number} type The type of entitlement
 * @prop {String?} userID The ID of the user that is granted access to the entitlement's sku
 */
class Entitlement extends Base {
  constructor(data, client) {
    super(data.id);
    this._client = client;

    this.applicationID = data.application_id;
    this.consumed = data.consumed;
    this.deleted = data.deleted;
    this.guildID = data.guild_id;
    this.skuID = data.sku_id;
    this.type = data.type;
    this.userID = data.user_id;

    if (data.ends_at !== undefined) {
      this.endsAt = data.ends_at ? Date.parse(data.ends_at) : null;
    }
    if (data.starts_at !== undefined) {
      this.startsAt = data.starts_at ? Date.parse(data.starts_at) : null;
    }
  }

  /**
   * Mark's this entitlement as consumed
   * @returns {Promise}
   */
  consume() {
    return this._client.consumeEntitlement.call(this._client, this.id);
  }
}

module.exports = Entitlement;