"use strict";

const Base = require("./Base.js");
const Entitlement = require("./Entitlement.js");

/**
 * Represents an SKU
 * @prop {String} applicationID The ID of the parent application
 * @prop {Number} flags The SKU flags combined as a bitfield
 * @prop {String} name The name of the SKU
 * @prop {String} slug System-generated URL slug based on the SKU's name
 * @prop {Number} type The type of SKU
 */
class SKU extends Base {
  constructor(data, client) {
    super(data.id);
    this._client = client;

    this.applicationID = data.application_id;
    this.flags = data.flags;
    this.name = data.name;
    this.slug = data.slug;
    this.type = data.type;
  }

  /**
   * Create a test entitlement for this SKU
   * @arg {String} ownerID The ID of the owner to create the entitlement for
   * @arg {Number} ownerType The type of the owner to create the entitlement for
   * @returns {Promise<Entitlement>}
   */
  createTestEntitlement(ownerID, ownerType) {
    return this._client.createTestEntitlement.call(this._client, {
        ownerID,
        ownerType,
        skuID: this.id
    });
  }

  /**
   * Get a list of entitlements for this SKU
   * @arg {Object} [options] The options for the request
   * @arg {String} [options.userID] The user ID to look up entitlements for
   * @arg {Number} [options.before] Retrieve entitlements before this entitlement ID
   * @arg {Number} [options.after] Retrieve entitlements after this entitlement ID
   * @arg {Number} [options.limit=100] The number of entitlements to return, 1-100, default 100
   * @arg {String} [options.guildID] The guild ID to look up entitlements for
   * @arg {Boolean} [options.excludeEnded] Whether or not ended entitlements should be omitted
   * @returns {Promise<Array<Entitlement>>}
   */
  getEntitlements(options = {}) {
    return this._client.getEntitlements.call(this._client, {
        skuIDs: [this.id],
        ...options
    });
  }
}

module.exports = SKU;