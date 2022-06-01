const Base = require("./Base");

class ApplicationCommand extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.applicationID = data.application_id;
        this.name = data.name;

        if(data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }
    }
}

module.exports = ApplicationCommand;
