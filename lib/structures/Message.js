"use strict";

const Base = require("./Base");
const Call = require("./Call");
const SystemJoinMessages = require("../Constants").SystemJoinMessages;
const User = require("./User");

/**
* Represents a message
* @prop {String} id The ID of the message
* @prop {PrivateChannel | TextChannel} channel The channel the message is in
* @prop {Number} timestamp Timestamp of message creation
* @prop {Number} type The type of the message
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
* @prop {Object?} activity The activity specified in the message
* @prop {Object?} application The application of the activity in the message
* @prop {Object} reactions An object containing the reactions on the message
* @prop {Number} reactions.count The number of times the reaction was used
* @prop {Boolean} reactions.me Whether or not the bot user did the reaction
* @prop {Boolean} pinned Whether the message is pinned or not
* @prop {Command?} command The Command used in the Message, if any (CommandClient only)
*/
class Message extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.type = data.type || 0;
        this.timestamp = Date.parse(data.timestamp);
        this.channel = client.getChannel(data.channel_id) || {
            id: data.channel_id
        };
        this.content = "";
        this.hit = !!data.hit;
        this.reactions = {};
        if(data.author) {
            if(data.author.discriminator !== "0000") {
                this.author = client.users.add(data.author, client);
            } else {
                this.author = new User(data.author, client);
            }
        } else {
            this._client.emit("error", new Error("MESSAGE_CREATE but no message author:\n" + JSON.stringify(data, null, 2)));
        }
        if(this.channel.guild) {
            if(data.member) {
                data.member.id = this.author.id;
                this.member = this.channel.guild.members.update(data.member, this.channel.guild);
            } else if (this.channel.guild.members.has(this.author.id)) {
                this.member = this.channel.guild.members.get(this.author.id);
            } else {
                this.member = null;
            }
        } else {
            this.member = null;
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
                if(data.call.participants.includes(client.user.id)) {
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
        } else if(this.type === 7) {
            data.content = SystemJoinMessages[~~(this.createdAt % SystemJoinMessages.length)].replace(/%user%/g, this.author.mention);
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
            this.mentionEveryone = !!data.mention_everyone;

            this.mentions = data.mentions.map((mention) => {
                let user = client.users.add(mention, client);
                if(mention.member && this.channel.guild) {
                    mention.member.id = mention.id;
                    this.channel.guild.members.update(mention.member, this.channel.guild);
                }
                return user;
            });

            this.roleMentions = data.mention_roles;
        }

        this.pinned = data.pinned !== undefined ? !!data.pinned : this.pinned;
        this.editedTimestamp = data.edited_timestamp !== null ? Date.parse(data.edited_timestamp) : this.editedTimestamp;
        this.tts = data.tts !== undefined ? data.tts : this.tts;
        this.attachments = data.attachments !== undefined ? data.attachments : this.attachments;
        this.embeds = data.embeds !== undefined ? data.embeds : this.embeds;
        this.activity = data.activity !== undefined ? data.activity : this.activity;
        this.application = data.application !== undefined ? data.application : this.application;

        if(data.reactions) {
            data.reactions.forEach((reaction) => {
                this.reactions[reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name] = {
                    count: reaction.count,
                    me: reaction.me
                };
            });
        }
    }

    get cleanContent() {
        let cleanContent = this.content;

        cleanContent = cleanContent.replace(/<(:\w+:)[0-9]+>/g, "$1");

        let authorName = this.author.username;
        if(this.channel.guild) {
            const member = this.channel.guild.members.get(this.author.id);
            if(member && member.nick) {
                authorName = member.nick;
            }
        }
        cleanContent = cleanContent.replace(new RegExp(`<@!?${this.author.id}>`, "g"), "@" + authorName);

        if(this.mentions) {
            this.mentions.forEach((mention) => {
                if(this.channel.guild) {
                    const member = this.channel.guild.members.get(mention.id);
                    if(member && member.nick) {
                        cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@" + member.nick);
                    }
                }
                cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@" + mention.username);
            });
        }

        if(this.channel.guild && this.roleMentions) {
            for(const roleID of this.roleMentions) {
                const role = this.channel.guild.roles.get(roleID);
                const roleName = role ? role.name : "deleted-role";
                cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@" + roleName);
            }
        }

        this.channelMentions.forEach((id) => {
            const channel = this._client.getChannel(id);
            if(channel && channel.name && channel.mention) {
                cleanContent = cleanContent.replace(channel.mention, "#" + channel.name);
            }
        });

        return cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
    }

    get channelMentions() {
        if(this._channelMentions) {
            return this._channelMentions;
        }

        return (this._channelMentions = (this.content.match(/<#[0-9]+>/g) || []).map((mention) => mention.substring(2, mention.length - 1)));
    }

    /**
    * Edit the message
    * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
    * @arg {String} content.content A content string
    * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
    * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discordapp.com/developers/docs/resources/channel#embed-object) for object structure
    * @returns {Promise<Message>}
    */
    edit(content) {
        return this._client.editMessage.call(this._client, this.channel.id, this.id, content);
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
    * Get a list of users who reacted with a specific reaction
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {Number} [limit=100] The maximum number of users to get
    * @arg {String} [before] Get users before this user ID
    * @arg {String} [after] Get users after this user ID
    * @returns {Promise<User[]>}
    */
    getReaction(reaction, limit, before, after) {
        return this._client.getMessageReaction.call(this._client, this.channel.id, this.id, reaction, limit, before, after);
    }

    /**
    * Add a reaction to a message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to react as
    * @returns {Promise}
    */
    addReaction(reaction, userID) {
        return this._client.addMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
    }

    /**
    * Remove a reaction from a message
    * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
    * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
    * @returns {Promise}
    */
    removeReaction(reaction, userID) {
        return this._client.removeMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
    }

    /**
    * Remove all reactions from a message
    * @returns {Promise}
    */
    removeReactions() {
        return this._client.removeMessageReactions.call(this._client, this.channel.id, this.id);
    }

    /**
    * Delete the message
    * @arg {String} [reason] The reason to be displayed in audit logs
    * @returns {Promise}
    */
    delete(reason) {
        return this._client.deleteMessage.call(this._client, this.channel.id, this.id, reason);
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["attachments", "author", "content", "editedTimestamp", "embeds", "hit", "mentionEveryone", "mentions", "pinned", "reactions", "roleMentions", "timestamp", "tts", "type"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = Message;
