const ActionRow = require("./components/ActionRow")
const Options = require("./components/Options")



class Interaction {
    constructor(data, client, guild, member, channel) {
        if (data?.type !== undefined) {
            this.type = data.type
        }
        if (data?.token !== undefined) {
            this.token = data.token
        }
        if (data?.member !== undefined) {
            this.member = member || this.member
        }
        if (data?.id !== undefined) {
            this.id = data.id
        }
        if (data?.guild_id !== undefined) {
            this.guild = guild || data.guild_id
        }
        if (data?.data !== undefined) {
            this.data = new ActionRow(data?.data, true)

            if (data?.data.name !== undefined) {
                this.data.name = data.data.name
            }

            if (data?.data.id !== undefined) {
                this.data.id = data.data.id
            } 

            if (data?.data.options !== undefined) {
                data.options.forEach((options) => {
                    this.data.components.push(new Options(options))
                });
            }
        }
        if (data?.channel !== undefined) {
            this.channel = channel || data.channel_id
        }
        if (client !== undefined) {
            this.client = client
        }
    }
}

module.exports = Interaction