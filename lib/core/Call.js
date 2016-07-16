"use strict";

const Collection = require("../util/Collection");
const VoiceState = require("./VoiceState");

/**
* Represents a call
* @prop {String} id The call ID
* @prop {String[]} participants The IDs of the call participants
* @prop {String?} endedTimestamp The timestamp of the call end
* @prop {Collection<VoiceState>} voiceStates The voice states of the call participants
* @prop {String[]?} ringing The IDs of people that still have not responded to the call request
* @prop {String?} region The region of the call server
*/
class Call {
    constructor(data) {
        this.id = data.id;
        this.voiceStates = new Collection(VoiceState);
        this.update(data);
    }

    update(data) {
        this.participants = data.participants !== undefined ? data.participants : this.participants || [];
        this.ringing = data.ringing !== undefined ? data.ringing : this.ringing || [];
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