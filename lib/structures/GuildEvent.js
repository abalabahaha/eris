"use strict";

const Base = require("./Base");
const User = require("./User");

/**
* Represents a guild scheduled event
* @prop {String} id The id of the guild event
* @prop {String} guildID The guild id of the event
* @prop {String} channelID The channel id of the event
* @prop {String} name The name of the event
* @prop {String?} description The description of the event
* @prop {Number} scheduledStartTime The time the event will start
* @prop {Number} scheduledEndTime The time the event will end, or null if the event does not have a scheduled time to end
* @prop {Number} privacyLevel Event privacy level
* @prop {Number} status The [status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status) of the scheduled event
* @prop {Number} entityType The [entity type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types) of the scheduled event
* @prop {String} entityID Entity id
* @prop {Object} entityMetadata Metadata for the event
* @prop {String} entityMetadata.location Location of the event
* @prop {User} creator The user that created the scheduled event
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
            this.entityMetadata = {location: data.location};
        }
        if(data.creator !== undefined) {
            this.creator = new User(data.creator ,this._client);
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
        return this._client.deleteGuildEvent.call(this._client, this.guildID, this.id);
    }

    /**
    * Edit this scheduled event
    * @arg {Object} event The new scheuled guild event object
    * @arg {String} [event.name] The name of the event
    * @arg {String} [event.channelID] The channel ID of the event
    * @arg {Object} [event.entityMetadata] The entity metadata for the scheduled event
    * @arg {String} [event.entityMetadata.location] Location of the event
    * @arg {String} [event.privacyLevel] The privacy level of the event
    * @arg {Date} [event.scheduledStartTime] The time the event will start
    * @arg {Date} [event.scheduledEndTime] The time when the scheduled event is scheduled to end
    * @arg {String} [event.description] The description of the event
    * @arg {Number} [event.entityType] The [entity type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types) of the scheduled event
    * @arg {Number} [event.status] The [status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status) of the scheduled event
    * @returns {Promise<GuildEvent>}
    */
    edit(event) {
        return this._client.editGuildEvent.call(this._client, this.guildID, this.id, event);
    }

    /**
    * List all users that subscribed to this event
    * @returns {}
    */
    listUsers() {
        return this._client.listGuildEventUsers.call(this._client, this.guildID, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "guildID",
            "channelID",
            "name",
            "description",
            "scheduledStartTime",
            "scheduledEndTime",
            "privacyLevel",
            "status",
            "entityType",
            "entityID",
            "entityMetadata",
            "creator",
            "userCount",
            ...props
        ]);
    }
}

module.exports = GuildEvent;
