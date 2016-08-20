"use strict";

const Collection = require("../util/Collection");
const VoiceState = require("./VoiceState");

/**
* Represents a call
* @prop {String} id The ID of the call
* @prop {GroupChannel} channel The call channel
* @prop {Collection<VoiceState>} voiceStates The voice states of the call participants
* @prop {String[]} participants The IDs of the call participants
* @prop {Number?} endedTimestamp The timestamp of the call end
* @prop {String[]?} ringing The IDs of people that still have not responded to the call request
* @prop {String?} region The region of the call server
* @prop {Boolean} unavailable Whether the call is unavailable or not
*/
class Call {
    constructor(data, channel) {
        this.id = data.id;
        this.channel = channel;
        this.voiceStates = new Collection(VoiceState);
        this.ringing = [];
        this.update(data);
    }

    update(data) {
        this.participants = data.participants !== undefined ? data.participants : this.participants || [];
        if(data.ringing !== undefined) {
            if(!~this.ringing.indexOf(this.channel.client.user.id) && ~(this.ringing = data.ringing).indexOf(this.channel.client.user.id)) {
                /**
                * Fired when the bot user is rung in a call
                * @event Client#callRing
                * @prop {Call} call The call
                */
                this.channel.client.emit("callRing", this);
            }
        }
        this.region = data.region !== undefined ? data.region : this.region || null;
        this.endedTimestamp = data.ended_timestamp !== undefined ? Date.parse(data.ended_timestamp) : this.endedTimestamp || null;
        this.unavailable = data.unavailable !== undefined ? data.unavailable : this.unavailable !== undefined ? this.unavailable : true;
        if(data.voice_states) {
            data.voice_states.forEach((voiceState) => {
                voiceState.id = voiceState.user_id;
                this.voiceStates.add(voiceState);
            });
        }
    }
}

module.exports = Call;