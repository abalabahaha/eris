"use strict";

const VoiceChannel = require("./VoiceChannel");

/**
* Represents a guild stage channel. See VoiceChannel for more properties and methods.
* @extends VoiceChannel
* @prop {String?} topic The topic of the channel
*/
class StageChannel extends VoiceChannel {
    update(data) {
        super.update(data);
        if(data.topic !== undefined) {
            this.topic = data.topic;
        }
    }

    toJSON(props = []) {
        return super.toJSON([
            "topic",
            ...props
        ]);
    }
}

module.exports = StageChannel;
