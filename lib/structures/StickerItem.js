

class StickerItem {
    constructor(data) {
        this.id = data.id
        if (data.name !== undefined) {
            this.name = data.name 
        }
        if (data.asset !== undefined) {
            this.asset = data.asset
        }
        if (data.tags !== undefined) {
            this.tags = data.tags
        }
        if (data.type !== undefined) {
            this.type = data.type
        }
        if (data.description !== undefined) {
            this.description = data.description
        }
        if (data.format_type !== undefined) {
            this.formatType = data.format_type
        }
        if (data.guild_id !== undefined) {
            this.guildID = data.guild_id
        }
    }


    get stickerAnimateURL() {
        return `https://media.discordapp.net/stickers/${this.id}.png?size=512&passthrough=true`
    }

    get stickerURL() {
        return `https://media.discordapp.net/stickers/${this.id}.png?size=512&passthrough=false`
    }


}

module.exports = StickerItem