"use strict";

const Base = require("./Base");

/**
* Represents a guild
* @prop {String} id The ID of the guild
* @prop {Boolean} unavailable Whether the guild is unavailable or not
* @prop {Shard} shard The Shard that owns the guild
*/
class UnavailableGuild extends Base {
    constructor(data, client) {
        super(data.id);
        this.shard = client.shards.get(client.guildShardMap[this.id]);
        this.unavailable = !!data.unavailable;
    }

    toJSON() {
        const base = super.toJSON(true);
        for(const prop of ["unavailable"]) {
            if(this[prop] !== undefined) {
                base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
            }
        }
        return base;
    }
}

module.exports = UnavailableGuild;
