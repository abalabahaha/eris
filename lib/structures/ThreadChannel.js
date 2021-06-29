const Channel = require('./Channel')

class ThreadChannel extends Channel {
	constructor(data, guild, channel, ownerMember) {

        this.lastMessageID = data.last_message_id
        this.threadMetadata = {}
        
        if (data.archived !== undefined) {
            this.threadMetadata.archived = data.threadMetadata.archived
        }
        
        if (data.archive_timestamp !== undefined) {
            this.threadMetadata.archivedTimestamp = Date.parse(data.threadMetadata.archive_timestamp)
        }
        
        if (data.auto_archive_duration !== undefined) {
            this.threadMetadata.autoArchiveDuration = data.threadMetadata.auto_archive_duration
        }
        
        if (data.locked !== undefined) {
            this.threadMetadata.locked = data.threadMetadata.locked
        }

        this.messageCount = data.message_count
        this.memberCount = data.member_count

        this.channel = channel
		this.ownerMember = ownerMember
		this.guild = guild
        
	}

	getMembers() {}
}


module.exports = ThreadChannel
