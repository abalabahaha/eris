"use strict";

const Call = require("../structures/Call");
const ExtendedUser = require("../structures/ExtendedUser");
const User = require("../structures/User");

module.exports = {
    "PRESENCE_UPDATE": (shard, packet) => {
        if(packet.d.user.username !== undefined) {
            var user = shard.client.users.get(packet.d.user.id);
            var oldUser = null;
            if(user && (user.username !== packet.d.user.username || user.avatar !== packet.d.user.avatar)) {
                oldUser = {
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar
                };
            }
            if(!user || oldUser) {
                user = shard.client.users.update(packet.d.user);
                /**
                * Fired when a user's username or avatar changes
                * @event Client#userUpdate
                * @prop {User} user The updated user
                * @prop {Object?} oldUser The old user data
                * @prop {String} oldUser.username The username of the user
                * @prop {String} oldUser.discriminator The discriminator of the user
                * @prop {String?} oldUser.avatar The hash of the user's avatar, or null if no avatar
                */
                shard.client.emit("userUpdate", user, oldUser);
            }
        }
        if(!packet.d.guild_id) {
            packet.d.id = packet.d.user.id;
            var relationship = shard.client.relationships.get(packet.d.id);
            if(!relationship) { // Removing relationships
                return;
            }
            var oldPresence = {
                game: relationship.game,
                status: relationship.status
            };
            /**
            * Fired when a guild member or relationship's status or game changes
            * @event Client#presenceUpdate
            * @prop {Member | Relationship} other The updated member or relationship
            * @prop {Object?} oldPresence The old presence data. If the user was offline when the bot started and the client option getAllUsers is not true, shard will be null
            * @prop {String} oldPresence.status The other user's old status. Either "online", "idle", or "offline"
            * @prop {Object?} oldPresence.game The old game the other user was playing
            * @prop {String} oldPresence.game.name The name of the active game
            * @prop {Number} oldPresence.game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
            * @prop {String} oldPresence.game.url The url of the active game
            */
            shard.client.emit("presenceUpdate", shard.client.relationships.update(packet.d), oldPresence);
            return;
        }
        var guild = shard.client.guilds.get(packet.d.guild_id);
        if(!guild) {
            shard.client.emit("warn", "Rogue presence update: " + JSON.stringify(packet), shard.id);
            return;
        }
        var member = guild.members.get(packet.d.id = packet.d.user.id);
        var oldPresence = null;
        if(member && (member.status !== packet.d.status || (member.game !== packet.d.game && (!member.game || !packet.d.game || member.game.name !== packet.d.game.name || member.game.type !== packet.d.game.type || member.game.url !== packet.d.game.url)))) {
            oldPresence = {
                game: member.game,
                status: member.status
            };
        }
        if((!member && packet.d.user.username) || oldPresence) {
            member = guild.members.update(packet.d, guild);
            shard.client.emit("presenceUpdate", member, oldPresence);
        }
    },
    "VOICE_STATE_UPDATE": (shard, packet) => {
        if(packet.d.guild_id === undefined) {
            packet.d.id = packet.d.user_id;
            if(packet.d.channel_id === null) {
                var flag = false;
                for(var groupChannel of shard.client.groupChannels) {
                    var call = (groupChannel[1].call || groupChannel[1].lastCall);
                    if(call && call.voiceStates.remove(packet.d)) {
                        flag = true;
                        return;
                    }
                }
                if(!flag) {
                    for(var privateChannel of shard.client.privateChannels) {
                        var call = (privateChannel[1].call || privateChannel[1].lastCall);
                        if(call && call.voiceStates.remove(packet.d)) {
                            flag = true;
                            return;
                        }
                    }
                    if(!flag) {
                        shard.client.emit("error", new Error("VOICE_STATE_UPDATE for user leaving call not found"));
                        return;
                    }
                }
            } else {
                var channel = shard.client.getChannel(packet.d.channel_id);
                if(!channel.call && !channel.lastCall) {
                    shard.client.emit("error", new Error("VOICE_STATE_UPDATE for untracked call"));
                    return;
                }
                (channel.call || channel.lastCall).voiceStates.update(packet.d);
            }
            return;
        }
        var guild = shard.client.guilds.get(packet.d.guild_id);
        if(!guild) {
            return;
        }
        if(guild.pendingVoiceStates) {
            guild.pendingVoiceStates.push(packet.d);
            return;
        }
        var member = guild.members.get(packet.d.id = packet.d.user_id);
        if(!member) {
            var channel = guild.channels.find((channel) => channel.type === 2 && channel.voiceMembers.get(packet.d.id));
            if(channel) {
                channel.voiceMembers.remove(packet.d);
                shard.client.emit("warn", "VOICE_STATE_UPDATE member null but in channel: " + packet.d.id, shard.id);
                return;
            }
            return;
        }
        var oldState = {
            mute: member.voiceState.mute,
            deaf: member.voiceState.deaf,
            selfMute: member.voiceState.selfMute,
            selfDeaf: member.voiceState.selfDeaf
        };
        var oldChannelID = member.voiceState.channelID;
        member.update(packet.d, shard.client);
        if(member.user.id === shard.client.user.id) {
            var voiceConnection = shard.client.voiceConnections.guilds[packet.d.guild_id];
            if(voiceConnection && voiceConnection.channelID !== packet.d.channel_id) {
                voiceConnection.switchChannel(packet.d.channel_id, true);
            }
        }
        if(oldChannelID != packet.d.channel_id) {
            var oldChannel, newChannel;
            if(oldChannelID) {
                oldChannel = guild.channels.get(oldChannelID);
            }
            if(packet.d.channel_id && (newChannel = guild.channels.get(packet.d.channel_id)) && newChannel.type === 2) { // Welcome to Discord, where one can "join" text channels
                if(oldChannel) {
                    /**
                    * Fired when a guild member switches voice channels
                    * @event Client#voiceChannelSwitch
                    * @prop {Member} member The member
                    * @prop {GuildChannel} newChannel The new voice channel
                    * @prop {GuildChannel} oldChannel The old voice channel
                    */
                    oldChannel.voiceMembers.remove(member);
                    shard.client.emit("voiceChannelSwitch", newChannel.voiceMembers.add(member, guild), newChannel, oldChannel);
                } else {
                    /**
                    * Fired when a guild member joins a voice channel. shard event is not fired when a member switches voice channels, see `voiceChannelSwitch`
                    * @event Client#voiceChannelJoin
                    * @prop {Member} member The member
                    * @prop {GuildChannel} newChannel The voice channel
                    */
                    shard.client.emit("voiceChannelJoin", newChannel.voiceMembers.add(member, guild), newChannel);
                }
            } else if(oldChannel) {
                /**
                * Fired when a guild member leaves a voice channel. shard event is not fired when a member switches voice channels, see `voiceChannelSwitch`
                * @event Client#voiceChannelLeave
                * @prop {Member} member The member
                * @prop {GuildChannel} oldChannel The voice channel
                */
                shard.client.emit("voiceChannelLeave", oldChannel.voiceMembers.remove(member), oldChannel);
            }
        }
        if(oldState.mute !== member.mute || oldState.deaf !== member.deaf || oldState.selfMute !== member.selfMute || oldState.selfDeaf !== member.selfDeaf) {
            /**
            * Fired when a guild member's voice state changes
            * @event Client#voiceStateUpdate
            * @prop {Member} member The member
            * @prop {Object} oldState The old voice state
            * @prop {Boolean} oldState.mute The previous server mute status
            * @prop {Boolean} oldState.deaf The previous server deaf status
            * @prop {Boolean} oldState.selfMute The previous self mute status
            * @prop {Boolean} oldState.selfDeaf The previous self deaf status
            */
            shard.client.emit("voiceStateUpdate", member, oldState);
        }
    },
    "TYPING_START": (shard, packet) => {
        if(shard.client.listeners("typingStart").length > 0) {
            /**
            * Fired when a user begins typing
            * @event Client#typingStart
            * @prop {Channel} channel The text channel the user is typing in
            * @prop {User} user The user
            */
            shard.client.emit("typingStart", shard.client.getChannel(packet.d.channel_id), shard.client.users.get(packet.d.user_id));
        }
    },
    "MESSAGE_CREATE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(channel) { // MESSAGE_CREATE just when deleting o.o
            channel.lastMessageID = packet.d.id;
            /**
            * Fired when a message is created
            * @event Client#messageCreate
            * @prop {Message} message The message
            */
            shard.client.emit("messageCreate", channel.messages.add(packet.d, shard.client));
        } else {
            shard.client.emit("debug", "MESSAGE_CREATE but channel not found (OK if deleted channel)", shard.id);
        }
    },
    "MESSAGE_UPDATE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }
        var message = channel.messages.get(packet.d.id);
        var oldMessage = {
            id: packet.d.id
        };
        if(message) {
            oldMessage = {
                attachments: message.attachments,
                content: message.content,
                embeds: message.embeds,
                editedTimestamp: message.editedTimestamp,
                mentionedBy: message.mentionedBy,
                mentions: message.mentions,
                roleMentions: message.roleMentions,
                channelMentions: message.channelMentions,
                tts: message.tts
            };
        }
        /**
        * Fired when a message is updated
        * @event Client#messageUpdate
        * @prop {Message} message The updated message. If oldMessage was undefined, it is not recommended to use this since it will be very incomplete
        * @prop {Object?} oldMessage The old message data, if the message was cached
        * @prop {Object[]} oldMessage.id The ID of the message
        * @prop {Object[]?} oldMessage.attachments Array of attachments
        * @prop {Object[]?} oldMessage.embeds Array of embeds
        * @prop {String?} oldMessage.content Message content
        * @prop {Number?} oldMessage.editedTimestamp Timestamp of latest message edit
        * @prop {Object?} oldMessage.mentionedBy Object of if different things mention the bot user
        * @prop {Boolean?} oldMessage.tts Whether to play the message using TTS or not
        * @prop {String[]?} oldMessage.mentions Array of mentioned users' ids
        * @prop {String[]?} oldMessage.roleMentions Array of mentioned roles' ids.
        * @prop {String[]?} oldMessage.channelMentions Array of mentions channels' ids.
        */
        shard.client.emit("messageUpdate", channel.messages.update(packet.d, shard.client), oldMessage);
    },
    "MESSAGE_DELETE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }
        /**
        * Fired when a cached message is deleted
        * @event Client#messageDelete
        * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
        */
        shard.client.emit("messageDelete", channel.messages.remove(packet.d) || {
            id: packet.d.id,
            channel: channel
        });
    },
    "MESSAGE_DELETE_BULK": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }

        /**
         * Fired when a bulk delete occurs
         * @event Client#messageDeleteBulk
        * @prop {Message[] | Object[]} messages An array of (potentially partial) message objects. If a message is not cached, it will be an object with `id` and `channel` keys. No other property is guaranteed
         */
        shard.client.emit("messageDeleteBulk", packet.d.ids.map((id) => (channel.messages.remove({
            id
        }) || {
                id: id,
                channel: channel
            })));
    },
    "MESSAGE_REACTION_ADD": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }
        var message = channel.messages.get(packet.d.message_id);
        if(message) {
            var reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            if(message.reactions[reaction]) {
                ++message.reactions[reaction].count;
                if(packet.d.user_id === shard.client.user.id) {
                    message.reactions[reaction].me = true;
                }
            } else {
                message.reactions[reaction] = {
                    count: 1,
                    me: packet.d.user_id === shard.client.user.id
                };
            }
        }
        /**
        * Fired when someone adds a reaction to a message
        * @event Client#messageReactionAdd
        * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
        * @prop {Object} emoji The reaction emoji object
        * @prop {String?} emoji.id The emoji ID (null for non-custom emojis)
        * @prop {String} emoji.name The emoji name
        * @prop {String} userID The ID of the user that added the reaction
        */
        shard.client.emit("messageReactionAdd", message || {
            id: packet.d.message_id,
            channel: channel
        }, packet.d.emoji, packet.d.user_id);
    },
    "MESSAGE_REACTION_REMOVE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }
        var message = channel.messages.get(packet.d.message_id);
        if(message) {
            var reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            if(message.reactions[reaction]) {
                --message.reactions[reaction].count;
                if(packet.d.user_id === shard.client.user.id) {
                    message.reactions[reaction].me = false;
                }
            }
        }
        /**
        * Fired when someone removes a reaction from a message
        * @event Client#messageReactionRemove
        * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
        * @prop {Object} emoji The reaction emoji object
        * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
        * @prop {String} emoji.name The emoji name
        * @prop {String} userID The ID of the user that removed the reaction
        */
        shard.client.emit("messageReactionRemove", message || {
            id: packet.d.message_id,
            channel: channel
        }, packet.d.emoji, packet.d.user_id);
    },
    "MESSAGE_REACTIONS_REMOVE_ALL": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            return;
        }
        /**
        * Fired when someone removes a reaction from a message
        * @event Client#messageReactionRemove
        * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
        * @prop {Object} emoji The reaction emoji object
        * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
        * @prop {String} emoji.name The emoji name
        * @prop {String} userID The ID of the user that removed the reaction
        */
        shard.client.emit("messageReactionRemoveAll", channel.messages.get(packet.d.message_id) || {
            id: packet.d.message_id,
            channel: channel
        });
    },
    "GUILD_MEMBER_ADD": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.guild_id);
        packet.d.id = packet.d.user.id;
        ++guild.memberCount;
        /**
        * Fired when a member joins a server
        * @event Client#guildMemberAdd
        * @prop {Guild} guild The guild
        * @prop {Member} member The member
        */
        shard.client.emit("guildMemberAdd", guild, guild.members.add(packet.d, guild));
    },
    "GUILD_MEMBER_UPDATE": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.guild_id);
        var member = guild.members.get(packet.d.id = packet.d.user.id);
        var oldMember = null;
        if(member) {
            oldMember = {
                roles: member.roles,
                nick: member.nick
            };
        }
        member = guild.members.update(packet.d, guild);
        /**
        * Fired when a member's roles or nickname are updated
        * @event Client#guildMemberUpdate
        * @prop {Guild} guild The guild
        * @prop {Member} member The updated member
        * @prop {Object?} oldMember The old member data
        * @prop {String[]} oldMember.roles An array of role IDs this member is a part of
        * @prop {String?} oldMember.nick The server nickname of the member
        */
        shard.client.emit("guildMemberUpdate", guild, member, oldMember);
    },
    "GUILD_MEMBER_REMOVE": (shard, packet) => {
        if(packet.d.user.id === shard.client.user.id) { // The bot is probably leaving
            return;
        }
        var guild = shard.client.guilds.get(packet.d.guild_id);
        --guild.memberCount;
        packet.d.id = packet.d.user.id;
        /**
        * Fired when a member leaves a server
        * @event Client#guildMemberRemove
        * @prop {Guild} guild The guild
        * @prop {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
        */
        shard.client.emit("guildMemberRemove", guild, guild.members.remove(packet.d) || {
            id: packet.d.id,
            user: new User(packet.d.user)
        });
    },
    "GUILD_CREATE": (shard, packet) => {
        shard.client.guildShardMap[packet.d.id] = shard.id;
        if(!packet.d.unavailable) {
            var guild = shard.createGuild(packet.d);
            if(shard.ready) {
                if(shard.client.unavailableGuilds.remove(packet.d)) {
                    /**
                    * Fired when an guild becomes available
                    * @event Client#guildAvailable
                    * @prop {Guild} guild The guild
                    */
                    shard.client.emit("guildAvailable", guild);
                } else {
                    /**
                    * Fired when an guild is created
                    * @event Client#guildCreate
                    * @prop {Guild} guild The guild
                    */
                    shard.client.emit("guildCreate", guild);
                }
            } else {
                shard.client.unavailableGuilds.remove(packet.d);
                shard.restartGuildCreateTimeout();
            }
        } else {
            shard.client.guilds.remove(packet.d);
            /**
            * Fired when an unavailable guild is created
            * @event Client#unavailableGuildCreate
            * @prop {UnavailableGuild} guild The unavailable guild
            */
            shard.client.emit("unavailableGuildCreate", shard.client.unavailableGuilds.add(packet.d, shard.client));
        }
    },
    "GUILD_UPDATE": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.id);
        var oldGuild = null;
        oldGuild = {
            name: guild.name,
            verificationLevel: guild.verification_level,
            splash: guild.splash,
            region: guild.region,
            ownerID: guild.owner_id,
            icon: guild.icon,
            features: guild.features,
            emojis: guild.emojis,
            afkChannelID: guild.afk_channel_id,
            afkTimeout: guild.afk_timeout
        };
        /**
        * Fired when an guild is updated
        * @event Client#guildUpdate
        * @prop {Guild} guild The guild
        * @prop {Object} oldGuild The old guild data
        * @prop {String} oldGuild.name The name of the guild
        * @prop {Number} oldGuild.verificationLevel The guild verification level
        * @prop {String} oldGuild.region The region of the guild
        * @prop {String?} oldGuild.icon The hash of the guild icon, or null if no icon
        * @prop {String} oldGuild.afkChannelID The ID of the AFK voice channel
        * @prop {Number} oldGuild.afkTimeout The AFK timeout in seconds
        * @prop {String} oldGuild.ownerID The ID of the user that is the guild owner
        * @prop {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
        * @prop {Object[]} oldGuild.features An array of guild features
        * @prop {Object[]} oldGuild.emojis An array of guild emojis
        */
        shard.client.emit("guildUpdate", shard.client.guilds.update(packet.d, shard.client), oldGuild);
    },
    "GUILD_DELETE": (shard, packet) => {
        shard.client.guildShardMap[packet.d.id] = undefined;
        var guild = shard.client.guilds.remove(packet.d);
        if(guild) { // Discord sends GUILD_DELETE for guilds that were previously unavailable in READY
            guild.channels.forEach((channel) => {
                shard.client.channelGuildMap[channel.id] = undefined;
            });
        }
        if(packet.d.unavailable) {
            /**
            * Fired when an guild becomes unavailable
            * @event Client#guildUnavailable
            * @prop {Guild} guild The guild
            */
            shard.client.emit("guildUnavailable", shard.client.unavailableGuilds.add(packet.d, shard.client));
        } else {
            /**
            * Fired when an guild is deleted
            * @event Client#guildDelete
            * @prop {Guild} guild The guild
            */
            shard.client.emit("guildDelete", guild || {
                id: packet.d.id
            });
        }
    },
    "GUILD_BAN_ADD": (shard, packet) => {
        /**
        * Fired when a user is banned from a guild
        * @event Client#guildBanAdd
        * @prop {Guild} guild The guild
        * @prop {User} user The banned user
        */
        shard.client.emit("guildBanAdd", shard.client.guilds.get(packet.d.guild_id), shard.client.users.add(packet.d.user, shard.client));
    },
    "GUILD_BAN_REMOVE": (shard, packet) => {
        /**
        * Fired when a user is unbanned from a guild
        * @event Client#guildBanRemove
        * @prop {Guild} guild The guild
        * @prop {User} user The banned user
        */
        shard.client.emit("guildBanRemove", shard.client.guilds.get(packet.d.guild_id), shard.client.users.add(packet.d.user, shard.client));
    },
    "GUILD_ROLE_CREATE": (shard, packet) => {
        /**
        * Fired when a guild role is created
        * @event Client#guildRoleCreate
        * @prop {Guild} guild The guild
        * @prop {Role} role The role
        */
        var guild = shard.client.guilds.get(packet.d.guild_id);
        shard.client.emit("guildRoleCreate", guild, guild.roles.add(packet.d.role, guild));
    },
    "GUILD_ROLE_UPDATE": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.guild_id);
        var role = guild.roles.add(packet.d.role, guild);
        var oldRole = null;
        if(role) {
            oldRole = {
                color: role.color,
                hoist: role.hoist,
                managed: role.managed,
                name: role.name,
                permissions: role.permissions,
                position: role.position
            };
        }
        /**
        * Fired when a guild role is updated
        * @event Client#guildRoleUpdate
        * @prop {Guild} guild The guild
        * @prop {Role} role The updated role
        * @prop {Object} oldRole The old role data
        * @prop {String} oldRole.name The name of the role
        * @prop {Boolean} oldRole.managed Whether a guild integration manages this role or not
        * @prop {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
        * @prop {Number} oldRole.color The hex color of the role in base 10
        * @prop {Number} oldRole.position The position of the role
        * @prop {Number} oldRole.permissions The permissions number of the role
        */
        shard.client.emit("guildRoleUpdate", guild, guild.roles.update(packet.d.role, guild), oldRole);
    },
    "GUILD_ROLE_DELETE": (shard, packet) => {
        /**
        * Fired when a guild role is deleted
        * @event Client#guildRoleDelete
        * @prop {Guild} guild The guild
        * @prop {Role} role The role
        */
        var guild = shard.client.guilds.get(packet.d.guild_id);
        if(guild) { // Eventual Consistency™ (╯°□°）╯︵ ┻━┻
            shard.client.emit("guildRoleDelete", guild, guild.roles.remove({ id: packet.d.role_id }));
        }
    },
    "CHANNEL_CREATE": (shard, packet) => {
        if(packet.d.type === undefined || packet.d.type === 1) {
            if(shard.id === 0) {
                /**
                * Fired when a channel is created
                * @event Client#channelCreate
                * @prop {Channel} channel The channel
                */
                shard.client.privateChannelMap[packet.d.recipients[0].id] = packet.d.id;
                shard.client.emit("channelCreate", shard.client.privateChannels.add(packet.d, shard.client));
            }
        } else if(packet.d.type === 0 || packet.d.type === 2) {
            var guild = shard.client.guilds.get(packet.d.guild_id);
            if(!guild) {
                return;
            }
            var channel = guild.channels.add(packet.d, guild);
            shard.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
            shard.client.emit("channelCreate", channel);
        } else if(packet.d.type === 3) {
            if(shard.id === 0) {
                shard.client.emit("channelCreate", shard.client.groupChannels.add(packet.d, shard.client));
            }
        } else {
            shard.emit("error", new Error("Unhandled CHANNEL_CREATE type: " + JSON.stringify(packet, null, 2)));
        }
    },
    "CHANNEL_UPDATE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.id);
        if(!channel) {
            return;
        }
        if(channel.type === 3) {
            if(shard.id !== 0) {
                return;
            }
            var oldChannel = {
                name: channel.name,
                ownerID: channel.ownerID,
                icon: channel.icon
            };
        }
        if(channel.type === 0 || channel.type === 2) {
            var oldChannel = {
                name: channel.name,
                topic: channel.topic,
                position: channel.position,
                bitrate: channel.bitrate,
                permissionOverwrites: channel.permissionOverwrites
            };
        }
        channel.update(packet.d);
        /**
        * Fired when a channel is updated
        * @event Client#channelUpdate
        * @prop {Channel} channel The updated channel
        * @prop {Object} oldChannel The old channel data
        * @prop {String} oldChannel.name The name of the channel
        * @prop {Number} oldChannel.position The position of the channel
        * @prop {String?} oldChannel.topic The topic of the channel (text channels only)
        * @prop {Number?} oldChannel.bitrate The bitrate of the channel (voice channels only)
        * @prop {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel
        */
        shard.client.emit("channelUpdate", channel, oldChannel);
    },
    "CHANNEL_DELETE": (shard, packet) => {
        if(packet.d.type === 1 || packet.d.type === undefined) {
            if(shard.id === 0) {
                var channel = shard.client.privateChannels.remove(packet.d);
                if(channel) {
                    shard.client.privateChannelMap[channel.recipient.id] = undefined;
                    /**
                    * Fired when a channel is deleted
                    * @event Client#channelDelete
                    * @prop {Channel} channel The channel
                    */
                    shard.client.emit("channelDelete", channel);
                }
            }
        } else if(packet.d.type === 0 || packet.d.type === 2) {
            shard.client.channelGuildMap[packet.d.id] = undefined;
            var channel = shard.client.guilds.get(packet.d.guild_id).channels.remove(packet.d);
            if(!channel) {
                return;
            }
            if(channel.type === 2) {
                channel.voiceMembers.forEach((member) => {
                    shard.client.emit("voiceChannelLeave", channel.voiceMembers.remove(member), channel);
                });
            }
            shard.client.emit("channelDelete", channel);
        } else if(packet.d.type === 3) {
            if(shard.id === 0) {
                shard.client.emit("channelDelete", shard.client.groupChannels.remove(packet.d));
            }
        } else {
            shard.emit("error", new Error("Unhandled CHANNEL_DELETE type: " + JSON.stringify(packet, null, 2)));
        }
    },
    "CALL_CREATE": (shard, packet) => {
        packet.d.id = packet.d.message_id;
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(channel.call) {
            channel.call.update(packet.d);
        } else {
            channel.call = new Call(packet.d, channel);
            var incrementedID = "";
            var overflow = true;
            var chunks = packet.d.id.match(/\d{1,9}/g).map((chunk) => parseInt(chunk));
            for(var i = chunks.length - 1; i >= 0; --i) {
                if(overflow) {
                    ++chunks[i];
                    overflow = false;
                }
                if(chunks[i] > 999999999) {
                    overflow = true;
                    incrementedID = "000000000" + incrementedID;
                } else {
                    incrementedID = chunks[i] + incrementedID;
                }
            }
            if(overflow) {
                incrementedID = overflow + incrementedID;
            }
            shard.client.getMessages(channel.id, 1, incrementedID);
        }
        /**
        * Fired when a call is created
        * @event Client#callCreate
        * @prop {Call} call The call
        */
        shard.client.emit("callCreate", channel.call);
    },
    "CALL_UPDATE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel.call) {
            throw new Error("CALL_UPDATE but channel has no call");
        }
        var oldCall = {
            participants: channel.call.participants,
            ringing: channel.call.ringing,
            region: channel.call.region,
            endedTimestamp: channel.call.endedTimestamp,
            unavailable: channel.call.unavailable,
        };
        /**
        * Fired when a call is updated
        * @event Client#callUpdate
        * @prop {Call} call The updated call
        * @prop {Object} oldCall The old call data
        * @prop {String[]} oldCall.participants The IDs of the call participants
        * @prop {Number?} oldCall.endedTimestamp The timestamp of the call end
        * @prop {String[]?} oldCall.ringing The IDs of people that were being rung
        * @prop {String?} oldCall.region The region of the call server
        * @prop {Boolean} oldCall.unavailable Whether the call was unavailable or not
        */
        shard.client.emit("callUpdate", channel.call.update(packet.d), oldCall);
    },
    "CALL_DELETE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel.call) {
            throw new Error("CALL_DELETE but channel has no call");
        }
        channel.lastCall = channel.call;
        channel.call = null;
        /**
        * Fired when a call is deleted
        * @event Client#callDelete
        * @prop {Call} call The call
        */
        shard.client.emit("callDelete", channel.lastCall);
    },
    "CHANNEL_RECIPIENT_ADD": (shard, packet) => {
        var channel = shard.client.groupChannels.get(packet.d.channel_id);
        /**
        * Fired when a user joins a group channel
        * @event Client#channelRecipientAdd
        * @prop {GroupChannel} channel The channel
        * @prop {User} user The user
        */
        shard.client.emit("channelRecipientAdd", channel, channel.recipients.add(shard.client.users.add(packet.d.user, shard.client)));
    },
    "CHANNEL_RECIPIENT_REMOVE": (shard, packet) => {
        var channel = shard.client.groupChannels.get(packet.d.channel_id);
        /**
        * Fired when a user leaves a group channel
        * @event Client#channelRecipientRemove
        * @prop {GroupChannel} channel The channel
        * @prop {User} user The user
        */
        shard.client.emit("channelRecipientRemove", channel, channel.recipients.remove(packet.d.user));
    },
    "FRIEND_SUGGESTION_CREATE": (shard, packet) => {
        /**
        * Fired when a client receives a friend suggestion
        * @event Client#friendSuggestionCreate
        * @prop {User} user The suggested user
        * @prop {String[]} reasons Array of reasons why this suggestion was made
        * @prop {Number} reasons.type Type of reason?
        * @prop {String} reasons.platform_type Platform you share with the user
        * @prop {String} reasons.name Username of suggested user on that platform
        */
        shard.client.emit("friendSuggestionCreate", new User(packet.d.suggested_user), packet.d.reasons);
    },
    "FRIEND_SUGGESTION_DELETE": (shard, packet) => {
        /**
        * Fired when a client's friend suggestion is removed for any reason
        * @event Client#friendSuggestionDelete
        * @prop {User} user The suggested user
        */
        shard.client.emit("friendSuggestionDelete", shard.client.users.get(packet.d.suggested_user_id));
    },
    "GUILD_MEMBERS_CHUNK": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.guild_id);
        if(shard.getAllUsersCount.hasOwnProperty(guild.id)) {
            if(shard.getAllUsersCount[guild.id] <= 1) {
                delete shard.getAllUsersCount[guild.id];
                shard.checkReady();
            } else {
                --shard.getAllUsersCount[guild.id];
            }
        }
        packet.d.members.forEach((member) => {
            member.id = member.user.id;
            guild.members.add(member, guild);
        });

        shard.lastHeartbeatAck = true;
    },
    "GUILD_SYNC": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.id);
        for(var member of packet.d.members) {
            member.id = member.user.id;
            guild.members.add(member, guild);
        }
        for(var presence of packet.d.presences) {
            if(!guild.members.get(presence.user.id)) {
                var userData = shard.client.users.get(presence.user.id);
                if(userData) {
                    userData = `{username: ${userData.username}, id: ${userData.id}, discriminator: ${userData.discriminator}}`;
                }
                shard.client.emit("debug", `Presence without member. ${presence.user.id}. In global user cache: ${userData}. ` + JSON.stringify(presence), shard.id);
                continue;
            }
            presence.id = presence.user.id;
            guild.members.update(presence);
        }
        if(guild.pendingVoiceStates && guild.pendingVoiceStates.length > 0) {
            for(var voiceState of guild.pendingVoiceStates) {
                if(!guild.members.get(voiceState.user_id)) {
                    continue;
                }
                voiceState.id = voiceState.user_id;
                var channel = guild.channels.get(voiceState.channel_id);
                if(channel) {
                    channel.voiceMembers.add(guild.members.update(voiceState));
                    if(shard.client.options.seedVoiceConnections && voiceState.id === shard.client.user.id && !shard.client.voiceConnections.get(channel.guild ? channel.guild.id : "call")) {
                        shard.client.joinVoiceChannel(channel.id, false);
                    }
                } else { // Phantom voice states from connected users in deleted channels (╯°□°）╯︵ ┻━┻
                    shard.client.emit("warn", "Phantom voice state received but channel not found | Guild: " + guild.id + " | Channel: " + voiceState.channel_id);
                }
            }
        }
        guild.pendingVoiceStates = null;
        --shard.unsyncedGuilds;
        shard.checkReady();
    },
    "READY": (shard, packet) => {
        shard.connectAttempts = 0;
        shard.reconnectInterval = 1000;

        shard.connecting = false;
        shard.status = "connected";
        shard.presence.status = "online";
        shard.client.shards._readyPacketCB();

        shard.client.user = shard.client.users.add(new ExtendedUser(packet.d.user), shard.client);
        if(shard.client.user.bot) {
            shard.client.bot = true;
            if(!shard.client.token.startsWith("Bot ")) {
                shard.client.token = "Bot " + shard.client.token;
            }
        } else {
            shard.client.bot = false;
        }

        if(packet.d._trace) {
            shard.discordServerTrace = packet.d._trace;
        }

        shard.sessionID = packet.d.session_id;

        packet.d.guilds.forEach((guild) => {
            if(guild.unavailable) {
                shard.client.guilds.remove(guild);
                shard.client.unavailableGuilds.add(guild, shard.client, true);
            } else {
                shard.client.unavailableGuilds.remove(shard.createGuild(guild));
            }
        });
        shard.guildCount = packet.d.guilds.length;

        packet.d.private_channels.forEach((channel) => {
            if(channel.type === undefined || channel.type === 1) {
                shard.client.privateChannelMap[channel.recipients[0].id] = channel.id;
                shard.client.privateChannels.add(channel, shard.client, true);
            } else if(channel.type === 3) {
                shard.client.groupChannels.add(channel, shard.client, true);
            } else {
                shard.emit("error", new Error("Unhandled READY private_channel type: " + JSON.stringify(channel, null, 2)));
            }
        });

        if(packet.d.relationships) {
            packet.d.relationships.forEach((relationship) => {
                shard.client.relationships.add(relationship, shard.client, true);
            });
        }

        if(packet.d.presences) {
            packet.d.presences.forEach((presence) => {
                if(shard.client.relationships.get(presence.user.id)) { // Avoid DM channel presences which are also in here
                    presence.id = presence.user.id;
                    shard.client.relationships.update(presence, null, true);
                }
            });
        }

        shard.preReady = true;
        /**
        * Fired when a shard finishes processing the ready packet
        * @event Client#shardPreReady
        * @prop {Number} id The ID of the shard
        */
        shard.client.emit("shardPreReady", shard.id);

        if(shard.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
            shard.restartGuildCreateTimeout();
        } else {
            shard.checkReady();
        }
    },
    "VOICE_SERVER_UPDATE": (shard, packet) => {
        packet.d.session_id = shard.sessionID;
        packet.d.user_id = shard.client.user.id;
        packet.d.shard = this;
        packet.d.opusOnly = shard.client.options.opusOnly;
        shard.client.voiceConnections.voiceServerUpdate(packet.d);
    },
    "USER_UPDATE": (shard, packet) => {
        shard.client.users.update(packet.d);

    },
    "RELATIONSHIP_ADD": (shard, packet) => {
        if(shard.client.bot) {
            return;
        }
        var relationship = shard.client.relationships.get(packet.d.id);
        if(relationship) {
            var oldRelationship = {
                type: relationship.type
            };
            /**
            * Fired when a relationship is updated
            * @event Client#relationshipUpdate
            * @prop {Relationship} relationship The relationship
            * @prop {Object} oldRelationship The old relationship data
            * @prop {Number} oldRelationship.type The old type of the relationship
            */
            shard.client.emit("relationshipUpdate", shard.client.relationships.update(packet.d), oldRelationship);
        } else {
            /**
            * Fired when a relationship is added
            * @event Client#relationshipAdd
            * @prop {Relationship} relationship The relationship
            */
            shard.client.emit("relationshipAdd", shard.client.relationships.add(packet.d, shard.client));
        }
    },
    "RELATIONSHIP_REMOVE": (shard, packet) => {
        if(shard.client.bot) {
            return;
        }
        /**
        * Fired when a relationship is removed
        * @event Client#relationshipRemove
        * @prop {Relationship} relationship The relationship
        */
        shard.client.emit("relationshipRemove", shard.client.relationships.remove(packet.d));
    },
    "GUILD_EMOJIS_UPDATE": (shard, packet) => {
        var guild = shard.client.guilds.get(packet.d.guild_id);
        var oldEmojis = guild.emojis;
        guild.update(packet.d);
        /**
        * Fired when a guild's emojis are updated
        * @event Client#guildEmojisUpdate
        * @prop {Guild} guild The guild
        * @prop {Array} emojis The updated emojis of the guild
        * @prop {Array} oldEmojis The old emojis of the guild
        */
        shard.client.emit("guildEmojisUpdate", guild, guild.emojis, oldEmojis);
    },
    "CHANNEL_PINS_UPDATE": (shard, packet) => {
        var channel = shard.client.getChannel(packet.d.channel_id);
        if(!channel) {
            shard.client.emit("debug", `CHANNEL_PINS_UPDATE target channel ${packet.d.channel_id} not found`);
            return;
        }
        var oldTimestamp = channel.lastPinTimestamp;
        channel.lastPinTimestamp = Date.parse(packet.d.timestamp);
        /**
        * Fired when a channel pin timestamp is updated
        * @event Client#channelPinUpdate
        * @prop {Channel} channel The channel
        * @prop {Number} timestamp The new timestamp
        * @prop {Number} oldTimestamp The old timestamp
        */
        shard.client.emit("channelPinUpdate", channel, channel.lastPinTimestamp, oldTimestamp);
    },
    "PRESENCES_REPLACE": (shard, packet) => {
        for(var presence of packet.d) {
            var guild = shard.client.guilds.get(presence.guild_id);
            if(!guild) {
                shard.client.emit("warn", "Rogue presences replace: " + JSON.stringify(presence), shard.id);
                continue;
            }
            var member = guild.members.get(presence.user.id);
            if(!member && presence.user.username) {
                presence.id = presence.user.id;
                member.update(presence);
            }
        }
    },
    "RESUMED": (shard, packet) => {
        shard.connectAttempts = 0;
        shard.reconnectInterval = 1000;

        shard.connecting = false;
        shard.status = "connected";
        shard.presence.status = "online";
        shard.client.shards._readyPacketCB();

        shard.preReady = true;
        shard.ready = true;

        /**
        * Fired when a shard finishes resuming
        * @event Shard#resume
        * @prop {Number} id The ID of the shard
        */
        shard.emit("resume");
    }
};