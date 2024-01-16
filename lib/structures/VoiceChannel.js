"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const Member = require("./Member");
const PermissionOverwrite = require("./PermissionOverwrite");

/**
 * Represents a guild voice channel. See GuildChannel for more properties and methods.
 * @extends GuildChannel
 * @prop {Number?} bitrate The bitrate of the channel
 * @prop {Collection<PermissionOverwrite>} permissionOverwrites Collection of PermissionOverwrites in this channel
 * @prop {Number} position The position of the channel
 * @prop {String?} rtcRegion The RTC region ID of the channel (automatic when `null`)
 * @prop {String?} topic The topic of the channel
 * @prop {Collection<Member>} voiceMembers Collection of Members in this channel
 */
class VoiceChannel extends GuildChannel {
    constructor(data, client) {
        super(data, client);
        this.voiceMembers = new Collection(Member);
        this.update(data);
    }

    update(data) {
        super.update(data);

        if(data.bitrate !== undefined) {
            this.bitrate = data.bitrate;
        }
        if(data.rtc_region !== undefined) {
            this.rtcRegion = data.rtc_region;
        }
        if(data.permission_overwrites) {
            this.permissionOverwrites = new Collection(PermissionOverwrite);
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.add(overwrite);
            });
        }
        if(data.position !== undefined) {
            this.position = data.position;
        }
    }

    /**
     * Create an invite for the channel
     * @arg {Object} [options] Invite generation options
     * @arg {Number} [options.maxAge] How long the invite should last in seconds
     * @arg {Number} [options.maxUses] How many uses the invite should last for
     * @arg {Boolean} [options.temporary] Whether the invite grants temporary membership or not
     * @arg {Boolean} [options.unique] Whether the invite is unique or not
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<Invite>}
     */
    createInvite(options, reason) {
        return this.client.createChannelInvite.call(this.client, this.id, options, reason);
    }

    /**
     * Get all invites in the channel
     * @returns {Promise<Array<Invite>>}
     */
    getInvites() {
        return this.client.getChannelInvites.call(this.client, this.id);
    }

    /**
     * Joins the channel.
     * @arg {Object} [options] VoiceConnection constructor options
     * @arg {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
     * @arg {Boolean} [options.selfDeaf] Whether the bot joins the channel deafened or not
     * @arg {Boolean} [options.selfMute] Whether the bot joins the channel muted or not
     * @arg {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
     * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
     */
    join(options) {
        return this.client.joinVoiceChannel.call(this.client, this.id, options);
    }

    /**
     * Leaves the channel.
     */
    leave() {
        return this.client.leaveVoiceChannel.call(this.client, this.id);
    }

    toJSON(props = []) {
        return super.toJSON([
            "bitrate",
            "permissionOverwrites",
            "position",
            "rtcRegion",
            "voiceMembers",
            ...props
        ]);
    }
}

module.exports = VoiceChannel;
