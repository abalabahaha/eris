"use strict";

const Call = require("./Call");

/**
* Represents a message
* @prop {String} id The message ID
* @prop {Channel} channel The channel the message is in
* @prop {Number} timestamp Timestamp of message creation
* @prop {User} author The message author
* @prop {?Member} member The message author with server-specific data
* @prop {String[]} mentions Array of mentioned users' ids
* @prop {String} content Message content
* @prop {String?} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
* @prop {String[]} roleMentions Array of mentioned roles' ids
* @prop {String[]?} channelMentions Array of mentions channels' ids, requires client option cleanContent
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
        this.type = data.type;
        this.timestamp = Date.parse(data.timestamp);
        this.channel = client.getChannel(data.channel_id) || {
            id: data.channel_id
        };
        if(data.author) {
            this.author = client.users.add(data.author);
            if(this.channel.guild) {
                this.member = this.channel.guild.members.get(this.author.id);
            }
        }
        if(this.type === 0 || this.type === undefined) {
        } else if(this.type === 1) {
            data.content = `${this.author.mention} added <@${data.mentions[0].id}>.`;
        } else if(this.type === 2) {
            if(this.author.id === data.mentions[0].id) {
                data.content = `@${this.author.username} left the group.`;
            } else {
                data.content = `${this.author.mention} removed @${data.mentions[0].username}.`;
            }
        } else if(this.type === 3) { // (╯°□°）╯︵ ┻━┻
            if(data.call.ended_timestamp) {
                if((!this.channel.lastCall || this.channel.lastCall.endedTimestamp < Date.parse(data.call.ended_timestamp))) {
                    data.call.id = this.id;
                    this.channel.lastCall = new Call(data.call, this.channel);
                }
                if(~data.call.participants.indexOf(client.user.id)) {
                    data.content = `You missed a call from ${this.author.mention}.`;
                } else {
                    data.content = `${this.author.mention} started a call.`;
                }
            } else {
                if(!this.channel.call) {
                    data.call.id = this.id;
                    this.channel.call = new Call(data.call, this.channel);
                }
                data.content = `${this.author.mention} started a call. — Join the call.`;
            }
        } else if(this.type === 4) {
            data.content = `${this.author.mention} changed the channel name: ${data.content}`;
        } else if(this.type === 5) {
            data.content = `${this.author.mention} changed the channel icon.`;
        } else {
            throw new Error("Unhandled MESSAGE_CREATE type: " + JSON.stringify(data, null, 2));
        }
        this.update(data, client);
    }

    update(data, client) {
        if(this.type === 3) { // (╯°□°）╯︵ ┻━┻
            (this.channel.call || this.channel.lastCall).update(data.call);
        }
        this.content = data.content || "";
        this.mentionedBy = {
            everyone: !!data.mention_everyone, // (╯°□°）╯︵ ┻━┻
            implicit: ~this.content.toLowerCase().indexOf(client.user.username.toLowerCase()),
            explicit: false
        };
        this.cleanContent = client.options.cleanContent ? this.content : null;
        (this.mentions = data.mentions || this.mentions).forEach((mention) => {
            if(client.options.cleanContent) {
                if(this.channel.guild) {
                    var member = this.channel.guild.members.get(mention.id);
                    if(member) {
                        this.cleanContent = this.cleanContent.replace(new RegExp(`<@\!${mention.id}>`, "g"), "@" + member.nick || mention.username);
                    }
                }
                this.cleanContent = this.cleanContent.replace(new RegExp(`<@\!?${mention.id}>`, "g"), "@" + mention.username);
            }
            if(mention.id === client.user.id) {
                this.mentionedBy.explicit = true;
            }
        });

        this.roleMentions = data.mention_roles || this.roleMentions;
        if(client.options.cleanContent && this.channel.guild) {
            for(var roleID of this.roleMentions) {
                this.cleanContent = this.cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@" + this.channel.guild.roles.get(roleID).name);
            }
            if(this.channel.guild.members.get(client.user.id).roles.find((role) => role && ~this.roleMentions.indexOf(role)) > 0) {
                this.mentionedBy.explicit = true;
            }
        }

        if(client.options.cleanContent) {
            this.channelMentions = (this.content.match(/<#[0-9]+>/g) || []).map((mention) => {
                var id = mention.substring(2, mention.length - 1);
                var channel = client.getChannel(id);
                if(channel && channel.name) {
                    this.cleanContent = this.cleanContent.replace(mention, "#" + channel.name);
                }
                return id;
            });

            this.cleanContent = this.cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
        }

        this.pinned = data.pinned !== undefined ? !!data.pinned : this.pinned;
        this.editedTimestamp = data.edited_timestamp !== undefined ? data.edited_timestamp : this.editedTimestamp;
        this.tts = data.tts !== undefined ? data.tts : this.tts;
        this.attachments = data.attachments !== undefined ? data.attachments : this.attachments; // TODO parse attachments
        this.embeds = data.embeds !== undefined ? data.embeds : this.embeds; // TODO parse embeds
    }
}

module.exports = Message;
