"use strict";

const Base = require("./Base");

/**
* [USER ACCOUNT] Represents a Relationship
* @prop {User} user The other user in the relationship
* @prop {Number} type The type of relationship. 1 is friend, 2 is block, 3 is incoming request, 4 is outgoing request
* @prop {String} status The other user's status. Either "online", "idle", or "offline"
* @prop {Object?} game The active game the other user is playing
* @prop {String} game.name The name of the active game
* @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
* @prop {String?} game.url The url of the active game
*/
class Relationship extends Base {
    constructor(data, client) {
        super(data.id);
        this.user = client.users.add(data.user, client);
        this.type = 0;
        this.status = "offline";
        this.game = null;
        this.update(data);
    }

    update(data) {
        if(data.type !== undefined) {
            this.type = data.type;
        }
        if(data.status !== undefined) {
            this.status = data.status;
        }
        if(data.game !== undefined) {
            this.game = data.game;
        }
    }

    toJSON(props = []) {
        return super.toJSON([
            "game",
            "status",
            "type",
            "user",
            ...props
        ]);
    }
}

module.exports = Relationship;
