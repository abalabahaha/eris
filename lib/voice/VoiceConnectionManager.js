"use strict";

/**
* Collects and manages VoiceConnections
*/
class VoiceConnectionManager {
    constructor(vcObject) {
        this.VC = vcObject || require("./VoiceConnection");
        this.pendingGuilds = {};
        this.guilds = {};
    }

    /**
    * Connect to a voice channel
    * @arg {String} guildID The ID of the guild of the voice channel
    * @arg {String} channelID The ID of the voice channel
    */
    join(guildID, channelID, options) {
        if(this.guilds[guildID]) {
            this.guilds[guildID].switchChannel(channelID);
            return Promise.resolve(this.guilds[guildID]);
        }
        return new Promise((res, rej) => {
            this.pendingGuilds[guildID] = {
                channelID: channelID,
                options: options,
                res: res,
                rej: rej,
                timeout: setTimeout(() => {
                    delete this.pendingGuilds[guildID];
                    rej();
                }, 10000)
            };
        });
    }

    voiceServerUpdate(data) {
        if(this.pendingGuilds[data.guild_id] && this.pendingGuilds[data.guild_id].timeout) {
            clearTimeout(this.pendingGuilds[data.guild_id].timeout);
            this.pendingGuilds[data.guild_id].timeout = null;
        }
        if(!this.guilds[data.guild_id]) {
            if(!this.pendingGuilds[data.guild_id]) {
                return;
            }
            this.guilds[data.guild_id] = new this.VC(data.guild_id, {
                shard: data.shard,
                opusOnly: data.opusOnly,
                manager: this,
                shared: this.pendingGuilds[data.guild_id].shared
            });
        }
        this.guilds[data.guild_id].connect({
            channel_id: (this.pendingGuilds[data.guild_id] || this.guilds[data.guild_id]).channelID,
            endpoint: data.endpoint,
            token: data.token,
            session_id: data.session_id,
            user_id: data.user_id
        });
        var disconnectHandler = () => {
            this.pendingGuilds[data.guild_id].rej(new Error("Disconnected"));
            delete this.pendingGuilds[data.guild_id];
            this.guilds[data.guild_id].removeListener("ready", readyHandler);
        };
        var readyHandler = () => {
            this.pendingGuilds[data.guild_id].res(this.guilds[data.guild_id]);
            delete this.pendingGuilds[data.guild_id];
            this.guilds[data.guild_id].removeListener("disconnect", disconnectHandler);
        };
        this.guilds[data.guild_id].once("ready", readyHandler).once("disconnect", disconnectHandler);
    }

    /**
    * Leave a voice channel
    * @arg {String} guildID The ID of the guild of the voice channel
    */
    leave(guildID) {
        if(!this.guilds[guildID]) {
            return;
        }
        this.guilds[guildID].disconnect();
        delete this.guilds[guildID];
    }

    switch(guildID, channelID) {
        if(!this.guilds[guildID]) {
            return;
        }
        this.guilds[guildID].switch(channelID);
    }

    /**
    * Get a voice connection by guild ID
    * @arg {String} guildID The ID of the guild of the voice connection
    */
    get(guildID) {
        return this.guilds[guildID];
    }
}

module.exports = VoiceConnectionManager;
