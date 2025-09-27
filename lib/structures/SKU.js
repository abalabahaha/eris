"use strict";

const Base = require("./Base.js");

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
   * @returns {Promise<Object>}
   */
  createTestEntitlement(ownerID, ownerType) {
    return this._client.createTestEntitlement.call(this._client, {
      ownerID: ownerID,
      ownerType: ownerType,
      skuID: this.id,
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
   * @returns {Promise<Array<Object>>}
   */
  getEntitlements(options = {}) {
    return this._client.getEntitlements.call(this._client, {
      skuIDs: [this.id],
      ...options,
    });
  }

  /**
   * Get a subscription by its ID from this SKU
   * @arg {String} [subscriptionID] The id of the subscription
   * @returns {Promise<Object>}
   */
  getSKUSubscription(subscriptionID) {
    return this._client.getSKUSubscription.call(this._client, this.id, subscriptionID);
  }

  /**
   * Get a list of subscriptions containing this SKU, filtered by user.
   * @arg {Object} [options] The options for the request
   * @arg {String} [options.userID] The user ID to look up subscriptions for. Required except for OAuth queries.
   * @arg {Number} [options.before] Retrieve subscriptions before this ID
   * @arg {Number} [options.after] Retrieve subscriptions after this ID
   * @arg {Number} [options.limit=50] The number of subscriptions to return, 1-100, default 50
   * @returns {Promise<Array<Object>>}
   */
  getSKUSubscriptions(options = {}) {
    return this._client.getSKUSubscriptions.call(this._client, this.id, options);
  }
}

module.exports = SKU;
