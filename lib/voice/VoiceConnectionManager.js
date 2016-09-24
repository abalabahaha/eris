"use strict";

const Collection = require("../util/Collection");
const VoiceConnection = require("./VoiceConnection");

/**
* Collects and manages VoiceConnections
* @extends Collection
*/
class VoiceConnectionManager extends Collection {
    constructor(client, object) {
        super(object || VoiceConnection);
        this._client = client;
    }

    /**
    * Connect to a voice channel
    * @arg {String} channelID The ID of the voice channel
    */
    join(channelID) {
        var connection = this.get(channelID);
        if(connection) {
            connection.switchChannel(channelID);
        } else {
            var guildID = this._client.channelGuildMap[channelID];
            var shard = this._client.shards.get(this._client.guildShardMap[guildID] || 0);
            connection = this.add(new VoiceConnection(guildID || "call", this._client.user.id, shard.sessionID, shard));
            connection.connect(channelID);
        }
        return connection;
    }

    /**
    * Leave a voice channel
    * @arg {String} targetID The ID of the voice channel
    */
    leave(targetID) {
        var connection = this.get(targetID);
        if(connection) {
            connection.disconnect();
            this.remove(connection);
        }
    }

    updateServer(packet) {
        var connection = this.get(packet.guild_id || "call");
        if(connection && connection.voiceServerUpdateCallback) {
            connection.voiceServerUpdateCallback(packet);
        }
    }

    /**
    * Gets the voice connection associated with the specified guild or channel
    * @arg {String} targetID The ID of the guild or channel
    */
    get(targetID) {
        return super.get(targetID) || super.get(this._client.channelGuildMap[targetID] || "call");
    }
}

module.exports = VoiceConnectionManager;
