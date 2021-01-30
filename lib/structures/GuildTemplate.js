const Base = require("./Base");
const Guild = require("./Guild");

/**
* Represents a guild template
* @prop {String} code The template code
* @prop {Number} createdAt Timestamp of template creation
* @prop {User} creator User that created the template
* @prop {String?} description The template description
* @prop {Boolean?} isDirty Whether the template has unsynced changes
* @prop {String} name The template name
* @prop {Guild} serializedSourceGuild The guild snapshot this template contains
* @prop {Guild | Object} sourceGuild The guild this template is based on. If the guild is not cached, this will be an object with `id` key. No other property is guaranteed
* @prop {Number} updatedAt Timestamp of template update
* @prop {Number} usageCount Number of times this template has been used
*/
class GuildTemplate {
    constructor(data, client) {
        this._client = client;
        this.code = data.code;
        this.createdAt = Date.parse(data.created_at);
        this.creator = client.users.update(data.creator, client);
        this.description = data.description;
        this.isDirty = data.is_dirty;
        this.name = data.name;
        this.serializedSourceGuild = new Guild(data.serialized_source_guild, client);
        this.sourceGuild = client.guilds.get(data.source_guild_id) || {id: data.source_guild_id};
        this.updatedAt = Date.parse(data.updated_at);
        this.usageCount = data.usage_count;
    }

    /**
    * Create a guild based on this template. This can only be used with bots in less than 10 guilds
    * @arg {String} name The name of the guild
    * @arg {String} [icon] The 128x128 icon as a base64 data URI
    * @returns {Promise<Guild>}
    */
    createGuild(name, icon) {
        return this._client.createGuildFromTemplate.call(this._client, this.code, name, icon);
    }

    /**
    * Delete this template
    * @returns {Promise<GuildTemplate>}
    */
    delete() {
        return this._client.deleteGuildTemplate.call(this._client, this.sourceGuild.id, this.code);
    }

    /**
    * Edit this template
    * @arg {Object} options The properties to edit
    * @arg {String} [options.name] The name of the template
    * @arg {String?} [options.description] The description for the template. Set to `null` to remove the description
    * @returns {Promise<GuildTemplate>}
    */
    edit(options) {
        return this._client.editGuildTemplate.call(this._client, this.sourceGuild.id, this.code, options);
    }

    /**
    * Force this template to sync to the guild's current state
    * @returns {Promise<GuildTemplate>}
    */
    sync() {
        return this._client.syncGuildTemplate.call(this._client, this.sourceGuild.id, this.code);
    }

    toJSON(props = []) {
        return Base.prototype.toJSON.call(this, [
            "code",
            "createdAt",
            "creator",
            "description",
            "isDirty",
            "name",
            "serializedSourceGuild",
            "sourceGuild",
            "updatedAt",
            "usageCount",
            ...props
        ]);
    }
}

module.exports = GuildTemplate;
