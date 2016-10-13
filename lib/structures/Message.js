"use strict";

const Call = require("./Call");
const User = require("./User");

/**
* Represents a message
* @prop {String} id The ID of the message
* @prop {Channel} channel The channel the message is in
* @prop {Guild?} guild The guild the message channel is in. Alias to channel.guild
* @prop {Number} timestamp Timestamp of message creation
* @prop {User} author The message author
* @prop {Member?} member The message author with server-specific data
* @prop {User[]} mentions Array of mentioned users
* @prop {String} content Message content
* @prop {String?} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
* @prop {String[]} roleMentions Array of mentioned roles' ids
* @prop {String[]?} channelMentions Array of mentions channels' ids
* @prop {Number?} editedTimestamp Timestamp of latest message edit
* @prop {Boolean} tts Whether to play the message using TTS or not
* @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
* @prop {Object[]} attachments Array of attachments
* @prop {Object[]} embeds Array of embeds
* @prop {Boolean} command True if message is a command, false if not (CommandClient only)
*/
class Message {
    constructor(data, client) {
        this.id = data.id;
        this._client = client;
        this.type = data.type;
        this.timestamp = Date.parse(data.timestamp);
        this.channel = client.getChannel(data.channel_id) || {
            id: data.channel_id
        };
        if(data.author) {
            if(data.author.discriminator !== "0000") {
                client.users.update(data.author);
            }
            this.author = new User(data.author, client);
        }
        if(this.type === 0 || this.type === undefined);
        else if(this.type === 1) {
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
        } else if(this.type === 6) {
            data.content = `${this.author.mention} pinned a message to this channel. See all the pins.`;
        } else {
            throw new Error("Unhandled MESSAGE_CREATE type: " + JSON.stringify(data, null, 2));
        }
        this.update(data, client);
    }

    update(data, client) {
        if(this.type === 3) { // (╯°□°）╯︵ ┻━┻
            (this.channel.call || this.channel.lastCall).update(data.call);
        }

        if(data.content !== undefined) {
            this.content = data.content || "";
            this._cleanContent = null;
            this.mentionEveryone = !!data.mention_everyone;

            this.mentions = data.mentions.map((mention) => client.users.add(mention, client));

            this.roleMentions = data.mention_roles;
        }

        this.pinned = data.pinned !== undefined ? !!data.pinned : this.pinned;
        this.editedTimestamp = data.edited_timestamp !== undefined ? Date.parse(data.edited_timestamp) : this.editedTimestamp;
        this.tts = data.tts !== undefined ? data.tts : this.tts;
        this.attachments = data.attachments !== undefined ? data.attachments : this.attachments; // TODO parse attachments
        this.embeds = data.embeds !== undefined ? data.embeds : this.embeds; // TODO parse embeds
    }

    get cleanContent() {
        if(this._cleanContent) {
            return this._cleanContent;
        }

        this._cleanContent = this.content;

        this.mentions.map((mention) => {
            if(this.channel.guild) {
                var member = this.channel.guild.members.get(mention.id);
                if(member) {
                    this._cleanContent = this._cleanContent.replace(new RegExp(`<@\!${mention.id}>`, "g"), "@" + member.nick || mention.username);
                }
            }
            this._cleanContent = this._cleanContent.replace(new RegExp(`<@\!?${mention.id}>`, "g"), "@" + mention.username);
        });

        if(this.channel.guild) {
            for(var roleID of this.roleMentions) {
                this._cleanContent = this._cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@" + this.channel.guild.roles.get(roleID).name);
            }
        }

        this.channelMentions.forEach((id) => {
            var channel = this._client.getChannel(id);
            if(channel && channel.name && channel.mention) {
                this._cleanContent = this._cleanContent.replace(channel.mention, "#" + channel.name);
            }
        });

        return (this._cleanContent = this._cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere"));
    }

    get guild() {
        return this.channel.guild;
    }

    get channelMentions() {
        if(this._channelMentions) {
            return this._channelMentions;
        }

        return (this._channelMentions = (this.content.match(/<#[0-9]+>/g) || []).map((mention) => mention.substring(2, mention.length - 1)));
    }

    get member() {
        return this.channel.guild && this.author && this.channel.guild.members.get(this.author.id) || null;
    }

    /**
    * Edit the message
    * @arg {String} content The updated message content
    * @arg {Boolean} [disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @returns {Promise<Message>}
    */
    edit(content, disableEveryone) {
        return this._client.editMessage.call(this._client, this.channel.id, this.id, content, disableEveryone);
    }

    /**
    * Pin the message
    * @returns {Promise}
    */
    pin() {
        return this._client.pinMessage.call(this._client, this.channel.id, this.id);
    }

    /**
    * Unpin the message
    * @returns {Promise}
    */
    unpin() {
        return this._client.unpinMessage.call(this._client, this.channel.id, this.id);
    }

    /**
    * Delete the message
    * @returns {Promise}
    */
    delete() {
        return this._client.deleteMessage.call(this._client, this.channel.id, this.id);
    }
}

module.exports = Message;
