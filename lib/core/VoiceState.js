"use strict";

/**
* Represents a user's voice state in a call/guild
* @prop {String} id The user ID
* @prop {String} sessionID The current voice session ID of the user
* @prop {String} mute Whether the user is server muted or not
* @prop {String} deaf Whether the user is server deafened or not
* @prop {String} channelID The current voice channel ID of the user
* @prop {String} suppress Whether the user is suppressed or not
* @prop {String} selfMute Whether the user is self muted or not
* @prop {String} selfDeaf Whether the user is self deafened or not
*/
class VoiceState {
    constructor(data) {
        this.id = data.id;
        this.update(data);
    }

    update(data) {
        this.sessionID = data.session_id !== undefined ? data.session_id : this.sessionID || null;
        this.mute = data.mute !== undefined ? data.mute : this.mute || false;
        this.deaf = data.deaf !== undefined ? data.deaf : this.deaf || false;
        this.channelID = data.channel_id !== undefined ? data.channel_id : this.channelID || null;
        this.suppress = data.suppress !== undefined ? data.suppress : this.suppress || false; // Do bots care about this
        this.selfMute = data.self_mute !== undefined ? data.self_mute : this.selfMute || false;
        this.selfDeaf = data.self_deaf !== undefined ? data.self_deaf : this.selfDeaf || false;
    }
}

module.exports = VoiceState;