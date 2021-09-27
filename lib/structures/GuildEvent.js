"use strict";

const Base = require("./Base");

/**
* Represents a guild scheduled event
* @prop {String} id The id of the guild event
* @prop {String} guildID The guild id of the event
* @prop {String} channelID The channel id of the event
* @prop {String} name The name of the event
* @prop {String?} description The description of the event
* @prop {String} image The image hash of the event
* @prop {Number} scheduledStartTime The time the event will start
* @prop {Number} scheduledEndTime The time the event will end, or null if the event does not have a scheduled time to end
* @prop {Number} privacyLevel Event privacy level
* @prop {Number} status The [scheduled status](https://discord.com/developers/docs/resources/guild_event/guild-event-object-guild-scheduled-event-status) of the event
* @prop {Number} entityType The [scheduled entity type](https://discord.com/developers/docs/resources/guild_event/guild-event-object-guild-scheduled-event-entity-types) of the event
* @prop {String} entityID Entity id
* @prop {Object} entityMetadata Metadata for the event
* @prop {Array<String>} entityMetadata.speakerIDs The speakers of the stage channel
* @prop {String} entityMetadata.location Location of the event
* @prop {Array<String>} skuIDs Sku ids
* @prop {Array} skus Skus
* @prop {Number?} userCount Users subscribed to the event
*/
class GuildEvent extends Base {
    constructor(data, client) {
        super(data.id);

        this._client = client;
        this.scheduledEndTime = null;
        this.update(data);
    }

    update(data) {
        if(data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }
        if(data.channel_id !== undefined) {
            this.channelID = data.channel_id;
        }
        if(data.name !== undefined) {
            this.name = data.name;
        }
        if(data.description !== undefined) {
            this.description = data.description;
        }
        if(data.image !== undefined) {
            this.image = data.image;
        }
        if(data.scheduled_start_time !== undefined) {
            this.scheduledStartTime = Date.parse(data.scheduled_start_time);
        }
        if(data.scheduled_end_time !== undefined) {
            this.scheduledEndTime = Date.parse(data.scheduled_end_time);
        }
        if(data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }
        if(data.status !== undefined) {
            this.status = data.status;
        }
        if(data.entity_type !== undefined) {
            this.entityType = data.entity_type;
        }
        if(data.entity_id !== undefined) {
            this.entityID = data.entity_id;
        }
        if(data.entity_metadata !== undefined) {
            this.entityMetadata = {speakerIDs: data.speaker_ids, location: data.location};
        }
        if(data.sku_ids !== undefined) {
            this.skuIDs = data.sku_ids;
        }
        if(data.skus !== undefined && data.skus.length > 0) {
            this.skus = data.skus;
        }
        if(data.user_count !== undefined) {
            this.userCount = data.user_count;
        }
    }

    /**
    * Delete this scheduled event
    * @returns {Promise}
    */
    delete() {
        return this._client.deleteGuildEvent.call(this._client, this.id);
    }

    /**
    * Edit this scheduled event
    * @arg {Object} event The event to be edited
    * @arg {String} [event.name] The name of the event
    * @arg {String} [event.channelID] The channel ID of the event
    * @arg {String} [event.privacyLevel] The privacy level of the event
    * @arg {Date} [event.scheduledStartTime] The time the event will start
    * @arg {String} [event.description] The description of the event
    * @arg {Number} [event.entityType] The [scheduled entity type](https://discord.com/developers/docs/resources/guild_event/guild-event-object-guild-scheduled-event-entity-types) of the event
    * @returns {Promise}
    */
    edit(event) {
        return this._client.editGuildEvent.call(this._client, event, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "guildID",
            "channelID",
            "name",
            "description",
            "image",
            "scheduledStartTime",
            "scheduledEndTime",
            "privacyLevel",
            "status",
            "entityType",
            "entityID",
            "entityMetadata",
            "skuIDs",
            "skus",
            "userCount",
            ...props
        ]);
    }
}

module.exports = GuildEvent;
