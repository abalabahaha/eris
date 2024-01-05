"use strict";

const Base = require("./Base");
const Permission = require("./Permission");

/**
* Represents an application command
* @prop {String} applicationID The ID of the application that this command belongs to
* @prop {Permission?} defaultMemberPermissions The permissions required by default for this command to be usable
* @prop {Boolean?} defaultPermission [DEPRECATED] Indicates whether the command is enabled by default when the application is added to a guild
* @prop {String} description The description of the command (empty for user & message commands)
* @prop {Object?} descriptionLocalizations A map of [locales](https://discord.com/developers/docs/reference#locales) to descriptions for that locale
* @prop {Boolean?} dmPermission If this command can be used in direct messages (global commands only)
* @prop {Guild?} guild The guild associated with this command (guild commands only)
* @prop {String} id The ID of the application command
* @prop {String} name The name of the command
* @prop {Object?} nameLocalizations A map of [locales](https://discord.com/developers/docs/reference#locales) to names for that locale
* @prop {Boolean?} nsfw Indicates whether the command is age-restricted
* @prop {Array<Object>?} options The [options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure) associated with this command
* @prop {Number} type The [command type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
* @prop {String} version The id of the version of this command
*/
class ApplicationCommand extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.applicationID = data.application_id;
        this.name = data.name;
        this.description = data.description;
        this.defaultMemberPermissions = data.defaultMemberPermissions == null ? null : new Permission(data.default_member_permissions);
        this.version = data.version;

        if(data.type !== undefined) {
            this.type = data.type;
        }
        if(data.guild_id !== undefined) {
            this.guild = client.guilds.get(data.guild_id) || {
                id: data.guild_id
            };
        }
        if(data.name_localizations !== undefined) {
            this.nameLocalizations = data.name_localizations;
        }
        if(data.description_localizations !== undefined) {
            this.descriptionLocalizations = data.description_localizations;
        }
        if(data.options !== undefined) {
            this.options = data.options;
        }
        if(data.dm_permission !== undefined) {
            this.dmPermission = data.dm_permission;
        }
        if(data.default_permission !== undefined) {
            this.defaultPermission = data.default_permission;
        }
        if(data.nsfw !== undefined) {
            this.nsfw = data.nsfw;
        }
    }


    /**
    * Delete the command
    * @returns {Promise}
    */
    delete() {
        return this.guildID === undefined ? this._client.deleteCommand.call(this._client, this.id) : this._client.deleteGuildCommand.call(this._client, this.guildID, this.id);
    }

    /**
    * Edit this application command
    * @arg {Object} options The properties to edit
    * @arg {String?} [options.defaultMemberPermissions] The [permissions](https://discord.com/developers/docs/topics/permissions) required by default for this command to be usable
    * @arg {Boolean} [options.defaultPermission] [DEPRECATED] Whether the command is enabled by default when the app is added to a guild. Use `defaultMemberPermissions` instead.
    * @arg {String} [options.description] The command description (chat input commands only)
    * @arg {Object?} [options.descriptionLocalizations] A map of [locales](https://discord.com/developers/docs/reference#locales) to descriptions for that locale
    * @arg {Boolean} [options.dmPermission] If this command can be used in direct messages (global commands only)
    * @arg {String} [options.name] The command name
    * @arg {Object?} [options.nameLocalizations] A map of [locales](https://discord.com/developers/docs/reference#locales) to names for that locale
    * @arg {Array<Object>} [options.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
    * @arg {Boolean}
    * @returns {Promise<ApplicationCommand>}
    */
    edit(options) {
        return this.guildID === undefined ? this._client.editCommand.call(this._client, this.id, options) : this._client.editGuildCommand.call(this._client, this.id, this.guildID, options);
    }

    toJSON(props = []) {
        return super.toJSON([
            "applicationID",
            "defaultMemberPermissions",
            "defaultPermission",
            "description",
            "descriptionLocalizations",
            "dmPermission",
            "guild",
            "name",
            "nameLocalizations",
            "nsfw",
            "options",
            "type",
            "version",
            ...props
        ]);
    }
}

module.exports = ApplicationCommand;
