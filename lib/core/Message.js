"use strict";

/**
* Represents a message
* @prop {String} id The message ID
* @prop {Channel} channel The channel the message is in
* @prop {Number} timestamp Timestamp of message creation
* @prop {User} author The message author
* @prop {?Member} member The message author with server-specific data
* @prop {String[]} mentions Array of mentioned users' ids
* @prop {String} content Message content
* @prop {String} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
* @prop {String[]} roleMentions Array of mentioned roles' ids, requires client option moreMentions
* @prop {String[]} channelMentions Array of mentions channels' ids, requires client option moreMentions
* @prop {?Number} editedTimestamp Timestamp of latest message edit
* @prop {Boolean} tts Whether to play the message using TTS or not
* @prop {Object} mentionedBy Object of if different things mention the bot user
* @prop {Boolean} mentionedBy.everyone Whether the message mentions everyone or not (╯°□°）╯︵ ┻━┻
* @prop {?String[]} mentionedBy.roles Array of role IDs that the bot is in and were mentioned, or undefined if none
* @prop {Boolean} mentionedBy.implicit Whether the bot's username is in the message or not
* @prop {Boolean} mentionedBy.explicit Whether the bot user is explicitly mentioned or not
* @prop {Object[]} attachments Array of attachments
* @prop {Object[]} embeds Array of embeds
*/
class Message {
    constructor(data, client) {
        this.id = data.id;
        this.channel = client.getChannel(data.channel_id) || {
            id: data.channel_id
        };
        if(data.author) {
            this.author = client.users.add(data.author);
            if(this.channel.guild) {
                this.member = this.channel.guild.members.get(this.author.id);
            }
        }
        this.timestamp = Date.parse(data.timestamp);
        this.update(data, client);
    }

    update(data, client) {
        if(data.content === undefined) {
            data.content = "";
        }
        this.pinned = data.pinned || false;
        this.cleanContent = this.content = data.content || "";
        this.cleanContent = this.cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
        this.mentionedBy = {
            everyone: !!data.mention_everyone, // (╯°□°）╯︵ ┻━┻
            implicit: ~this.content.toLowerCase().indexOf(client.user.username.toLowerCase()),
            explicit: false
        };
        this.mentions = (this.content.match(/<@\!?[0-9]+>/g) || []).map((mention) => {
            var id = mention.substring(mention[2] === "!" ? 3 : 2, mention.length - 1);
            if(id === client.user.id) {
                this.mentionedBy.explicit = true;
            }
            var user = this.channel.guild && this.channel.guild.members.get(id) || client.users.get(id);
            if(user) {
                this.cleanContent = this.cleanContent.replace(mention, `@${user.nick || (user.user || user).username}`);
            }
            return id;
        });
        this.roleMentions = [];
        this.channelMentions = [];

        if(client.options.moreMentions) {
            if(this.channel.guild) {
                var roles = this.channel.guild.members.get(client.user.id).roles;
                this.roleMentions = (this.content.match(/<@&[0-9]+>/g) || []).map((mention) => {
                    var id = mention.substring(3, mention.length - 1);
                    var role = this.channel.guild.roles.get(id);
                    if(role) {
                        this.cleanContent = this.cleanContent.replace(mention, `@${role.name}`);
                    }
                    return role.mentionable && id;
                });
                roles = roles.filter((role) => role && ~this.roleMentions.indexOf(role));
                if(roles.length > 0) {
                    this.mentionedBy.roles = roles;
                }
            }
            this.channelMentions = (this.content.match(/<#[0-9]+>/g) || []).map((mention) => {
                var id = mention.substring(2, mention.length - 1);
                var channel = client.getChannel(id);
                if(channel && channel.name) {
                    this.cleanContent = this.cleanContent.replace(mention, `#${channel.name}`);
                }
                return id;
            });
        }

        this.editedTimestamp = data.edited_timestamp !== undefined ? data.edited_timestamp : this.editedTimestamp;
        this.tts = data.tts !== undefined ? data.tts : this.tts;
        this.attachments = data.attachments !== undefined ? data.attachments : this.attachments; // TODO parse attachments
        this.embeds = data.embeds !== undefined ? data.embeds : this.embeds; // TODO parse embeds
    }
}

module.exports = Message;
