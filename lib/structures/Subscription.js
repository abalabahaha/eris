"use strict";

const Base = require("./Base.js");

/**
 * Represents a subscription
 * @prop {Number?} canceledAt When the subscription was canceled
 * @prop {Number?} currentPeriodEnd The end date of the current subscription period
 * @prop {Number?} currentPeriodStart The start date of the current subscription period
 * @prop {String?} country ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription. Missing unless queried with a private OAuth scope.
 * @prop {Array<String>?} renewalSKUIDs A list of SKUs that this user will be subscribed to at renewal
 * @prop {Array<String>} entitlementIDs A list of entitlements granted for this subscription
 * @prop {Array<String>} skuIDs A list of SKUs subscribed to
 * @prop {String} status The current status of the subscription
 * @prop {String} userID The ID of the user who is subscribed
 */
class Subscription extends Base {
  constructor(data) {
    super(data.id);

    this.country = data.country;
    this.renewalSKUIDs = data.renewal_sku_ids;
    this.entitlementIDs = data.entitlement_ids;
    this.skuIDs = data.sku_ids;
    this.status = data.status;
    this.userID = data.user_id;

    this.currentPeriodEnd = data.current_period_end ? Date.parse(data.current_period_end) : null;
    this.currentPeriodStart = data.current_period_start ? Date.parse(data.current_period_start) : null;

    if (data.canceled_at !== undefined) {
      this.canceledAt = data.canceled_at ? Date.parse(data.canceled_at) : null;
    }
  }
}

module.exports = Subscription;
