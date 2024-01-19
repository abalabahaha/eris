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
 * @prop {String} version The ID of the version of this command
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
     * @arg {Object} command A command object
     * @arg {BigInt | Number | String | Permission?} [command.defaultMemberPermissions] The default permissions the user must have to use the command
     * @arg {Boolean} [command.defaultPermission] [DEPRECATED] Whether the command is enabled by default when the application is added to a guild. Replaced by `defaultMemberPermissions`
     * @arg {String} [command.description] The command description, required for `CHAT_INPUT` commands
     * @arg {Object?} [command.descriptionLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command description
     * @arg {Boolean?} [command.dmPermission=true] Whether the command is available in DMs with the app (Global applications only)
     * @arg {String} [command.name] The command name
     * @arg {Object?} [command.nameLocalizations] Localization directory with keys in [available locales](https://discord.dev/reference#locales) for the command name
     * @arg {Boolean} [command.nsfw] Whether the command is age-restricted
     * @arg {Array<Object>} [command.options] The application command [options](https://discord.dev/interactions/application-commands#application-command-object-application-command-option-structure)
     * @returns {Promise<ApplicationCommand>} Resolves with the edited application command
     */
    edit(command) {
        return this.guildID === undefined ? this._client.editCommand.call(this._client, this.id, command) : this._client.editGuildCommand.call(this._client, this.id, this.guildID, command);
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
