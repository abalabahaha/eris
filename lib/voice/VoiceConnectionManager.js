"use strict";

const Collection = require("../util/Collection");

class VoiceConnectionManager extends Collection {
    constructor(vcObject) {
        super(vcObject || require("./VoiceConnection"));
        this.pendingGuilds = {};
    }

    join(guildID, channelID, options) {
        var connection = this.get(guildID);
        if(connection && connection.ws) {
            connection.switchChannel(channelID);
            if(connection.ready) {
                return Promise.resolve(connection);
            } else {
                return new Promise((res, rej) => {
                    var disconnectHandler = () => {
                        connection.removeListener("ready", readyHandler);
                        rej(new Error("Disconnected"));
                    };
                    var readyHandler = () => {
                        connection.removeListener("disconnect", disconnectHandler);
                        res(connection);
                    };
                    connection.once("ready", readyHandler).once("disconnect", disconnectHandler);
                });
            }
        }
        return new Promise((res, rej) => {
            this.pendingGuilds[guildID] = {
                channelID: channelID,
                options: options || {},
                res: res,
                rej: rej,
                timeout: setTimeout(() => {
                    delete this.pendingGuilds[guildID];
                    rej(new Error("Voice connection timeout"));
                }, 10000)
            };
        });
    }

    voiceServerUpdate(data) {
        if(this.pendingGuilds[data.guild_id] && this.pendingGuilds[data.guild_id].timeout) {
            clearTimeout(this.pendingGuilds[data.guild_id].timeout);
            this.pendingGuilds[data.guild_id].timeout = null;
        }
        var connection = this.get(data.guild_id);
        if(!connection) {
            if(!this.pendingGuilds[data.guild_id]) {
                return;
            }
            connection = this.add(new this.baseObject(data.guild_id, {
                shard: data.shard,
                opusOnly: this.pendingGuilds[data.guild_id].options.opusOnly,
                shared: this.pendingGuilds[data.guild_id].options.shared
            }));
        }
        connection.connect({
            channel_id: (this.pendingGuilds[data.guild_id] || connection).channelID,
            endpoint: data.endpoint,
            token: data.token,
            session_id: data.session_id,
            user_id: data.user_id
        });
        if(!this.pendingGuilds[data.guild_id] || this.pendingGuilds[data.guild_id].waiting) {
            return;
        }
        this.pendingGuilds[data.guild_id].waiting = true;
        var disconnectHandler = () => {
            connection = this.get(data.guild_id);
            if(!this.pendingGuilds[data.guild_id]) {
                if(connection) {
                    connection.removeListener("ready", readyHandler);
                }
                return;
            }
            connection.removeListener("ready", readyHandler);
            this.pendingGuilds[data.guild_id].rej(new Error("Disconnected"));
            delete this.pendingGuilds[data.guild_id];
        };
        var readyHandler = () => {
            connection = this.get(data.guild_id);
            if(!this.pendingGuilds[data.guild_id]) {
                if(connection) {
                    connection.removeListener("disconnect", disconnectHandler);
                }
                return;
            }
            connection.removeListener("disconnect", disconnectHandler);
            this.pendingGuilds[data.guild_id].res(connection);
            delete this.pendingGuilds[data.guild_id];
        };
        connection.once("ready", readyHandler).once("disconnect", disconnectHandler);
    }

    leave(guildID) {
        var connection = this.get(guildID);
        if(!connection) {
            return;
        }
        connection.disconnect();
        connection._destroy();
        this.remove(connection);
    }

    switch(guildID, channelID) {
        var connection = this.get(guildID);
        if(!connection) {
            return;
        }
        connection.switch(channelID);
    }
}

module.exports = VoiceConnectionManager;
