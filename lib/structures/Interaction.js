"use strict";

const Base = require("./Base");
const {InteractionTypes} = require("../Constants");
const Member = require("./Member");

/**
* Represents an interaction. You also probably want to look at AutocompleteInteraction, CommandInteraction, and ComponentInteraction.
* @prop {Boolean} acknowledged Whether or not the interaction has been acknowledged
* @prop {String} applicationID The ID of the interaction's application
* @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel the interaction was created in. Can be partial with only the id if the channel is not cached
* @prop {Object} data The data attached to the interaction. See AutocompleteInteraction, CommandInteraction, and ComponentInteraction for specific details
* @prop {String?} guildID The ID of the guild in which the interaction was created
* @prop {String?} guildLocale The selected language of the guild the command was invoked from (e.g. "en-US")
* @prop {String} id The ID of the interaction
* @prop {String?} locale The selected language of the invoking user (e.g. "en-US")
* @prop {Member?} member The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
* @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes after initial response and can be used to send followup messages but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
* @prop {Number} type The [interaction type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type)
* @prop {User?} user The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
* @prop {Number} version The interaction version
*/
class Interaction extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;

        this.applicationID = data.application_id;
        this.token = data.token;
        this.type = data.type;
        this.version = data.version;
        this.acknowledged = false;

        if(data.channel_id !== undefined) {
            this.channel = this._client.getChannel(data.channel_id) || {
                id: data.channel_id
            };
        }

        if(data.data !== undefined) {
            this.data = JSON.parse(JSON.stringify(data.data));
        }

        if(data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }

        if(data.member !== undefined) {
            if(this.channel.guild) {
                data.member.id = data.member.user.id;
                this.member = this.channel.guild.members.update(data.member, this.channel.guild);
            } else {
                const guild = this._client.guilds.get(data.guild_id);
                this.member = new Member(data.member, guild, this._client);
            }
        }

        if(data.user !== undefined) {
            this.user = this._client.users.update(data.user, client);
        }

        if(data.locale !== undefined) {
            this.locale = data.locale;
        }

        if(data.guild_locale !== undefined) {
            this.guildLocale = data.guild_locale;
        }
    }

    update() {
        this.acknowledged = true;
    }

    static from(data, client) {
        switch(data.type) {
            case InteractionTypes.APPLICATION_COMMAND: {
                return new CommandInteraction(data, client);
            }
            case InteractionTypes.MESSAGE_COMPONENT: {
                return new ComponentInteraction(data, client);
            }
            case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE: {
                return new AutocompleteInteraction(data, client);
            }
        }

        client.emit("warn", new Error(`Unknown interaction type: ${data.type}\n${JSON.stringify(data, null, 2)}`));
    }

    toJSON(props = []) {
        return super.toJSON([
            "acknowledged",
            "applicationID",
            "channel",
            "data",
            "guildLocale",
            "locale",
            "token",
            "type",
            "version",
            ...props
        ]);
    }
}

module.exports = Interaction;

// Circular import
const CommandInteraction      = require("./CommandInteraction");
const ComponentInteraction    = require("./ComponentInteraction");
const AutocompleteInteraction = require("./AutocompleteInteraction");
