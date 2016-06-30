"use strict";

const User = require("./User");

/**
* Represents a guild integration
* @prop {String} id The integration ID
* @prop {Number} createdAt Timestamp of guild integration creation
* @prop {String} name The integration name
* @prop {String} type The integration type
* @prop {String} roleID The ID of the role connected to the integration
* @prop {User} user The user connected to the integration
* @prop {Object} account The integration account info
* @prop {String} account.id The integration account id
* @prop {String} account.name The integration account name
* @prop {Boolean} enabled Whether the integration is enabled or not
* @prop {Boolean} syncing Whether the integration is syncing or not
* @prop {Number} expireBehavior behavior of expired subscriptions
* @prop {Number} expireGracePeriod grace period for expired subscriptions
* @prop {Boolean} enableEmoticons Whether integration emoticons are enabled or not
* @prop {Number} subscriberCount number of subscribers
* @prop {Number} syncedAt Unix timestamp of last integration sync
*/
class GuildIntegration {
    constructor(data) {
        this.id = data.id;
        this.createdAt = (+this.id / 4194304) + 1420070400000;
        this.name = data.name;
        this.type = data.type;
        this.roleID = data.role_id;
        this.user = new User(data.user);
        this.account = data.account; // not worth making a class for
        this.update(data);
    }

    update(data) {
        this.enabled = data.enabled;
        this.syncing = data.syncing;
        this.expireBehavior = data.expire_behavior;
        this.expireGracePeriod = data.expire_grace_period;
        this.enableEmoticons = data.enable_emoticons;
        this.subscriberCount = data.subscriber_count;
        this.syncedAt = data.synced_at;
    }
}

module.exports = GuildIntegration;