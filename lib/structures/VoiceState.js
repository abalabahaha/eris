"use strict";

const Base = require("./Base");

/**
* Represents a member's voice state in a call/guild
* @prop {String?} channelID The ID of the member's current voice channel
* @prop {Boolean} deaf Whether the member is server deafened or not
* @prop {String} id The ID of the member
* @prop {Boolean} mute Whether the member is server muted or not
* @prop {Number?} requestToSpeakTimestamp Timestamp of the member's latest request to speak
* @prop {Boolean} selfDeaf Whether the member is self deafened or not
* @prop {Boolean} selfMute Whether the member is self muted or not
* @prop {Boolean} selfStream Whether the member is streaming using "Go Live"
* @prop {Boolean} selfVideo Whether the member's camera is enabled
* @prop {Boolean} suppress Whether the member is suppressed or not
* @prop {String?} sessionID The ID of the member's current voice session
*/
class VoiceState extends Base {
    constructor(data) {
        super(data.id);
        this.mute = false;
        this.deaf = false;
        this.requestToSpeakTimestamp = null;
        this.selfMute = false;
        this.selfDeaf = false;
        this.selfStream = false;
        this.selfVideo = false;
        this.suppress = false;
        this.update(data);
    }

    update(data) {
        if(data.channel_id !== undefined) {
            this.channelID = data.channel_id;
            this.sessionID = data.channel_id === null ? null : data.session_id;
        } else if(this.channelID === undefined) {
            this.channelID = this.sessionID = null;
        }
        if(data.mute !== undefined) {
            this.mute = data.mute;
        }
        if(data.deaf !== undefined) {
            this.deaf = data.deaf;
        }
        if(data.request_to_speak_timestamp !== undefined) {
            this.requestToSpeakTimestamp = Date.parse(data.request_to_speak_timestamp);
        }
        if(data.self_mute !== undefined) {
            this.selfMute = data.self_mute;
        }
        if(data.self_deaf !== undefined) {
            this.selfDeaf = data.self_deaf;
        }
        if(data.self_video !== undefined) {
            this.selfVideo = data.self_video;
        }
        if(data.self_stream !== undefined) {
            this.selfStream = data.self_stream;
        }
        if(data.suppress !== undefined) { // Bots ignore this
            this.suppress = data.suppress;
        }
    }

    toJSON(props = []) {
        return super.toJSON([
            "channelID",
            "deaf",
            "mute",
            "requestToSpeakTimestamp",
            "selfDeaf",
            "selfMute",
            "selfStream",
            "selfVideo",
            "sessionID",
            "suppress",
            ...props
        ]);
    }
}

module.exports = VoiceState;
