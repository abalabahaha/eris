"use strict";

const Collection = require("../util/Collection");
const Role = require("./Role");

/**
* Represents a emoji
* @prop {String} id The ID of the emoji
* @prop {Number} createdAt Timestamp of guild creation
* @prop {String} name The name of the guild
* @prop {Collection<Role>} roles Collection of Roles the emoji is active for
* @prop {String} iconURL The URL of the emoji's icon
* @prop {Boolean} requireColons Whether the emoji must be wrapped in colons
* @prop {Boolean} managed Whether the emoji is managed
*/
class Emoji {
    constructor(data, guild) {
        this.id = data.id;
        this.createdAt = (this.id / 4194304) + 1420070400000;
        this.roles = new Collection(Role);

        for(var role of data.roles) {
            this.roles.add(guild.roles.get(role));
        }
        this.update(data);
    }

    update(data) {
        this.name = data.name !== undefined ? data.name : this.name;
        this.requireColons = data.require_colons !== undefined ? data.require_colons : this.requireColons;
        this.managed = data.managed !== undefined ? data.managed : this.managed;
    }

    get iconURL() {
        return this.icon ? `${CDN_URL}/emojis/${this.id}.png` : null;
    }
}

module.exports = Emoji;
