const Channel = require('./Channel')

class ThreadChannel extends Channel {
	constructor(data, client) {
        super(data, client);
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
       
        if (this.client.users.get(data.owner_id) == null) {
            this.ownerMember = data.owner_id
        } else {
            this.ownerMember = this.client.guilds.get(data.guild_id).members.get(data.owner_id)
        }

		this.guild = this.client.guilds.get(data.guild_id)
        
	}



	getThreadsActive() {
        return this.client.getThreadsActive(this.id)
    }

    getThreadsMe() {
        return this.client.getThreadsMe(this.id)
    }

    getThreadsPrivate() {
        return this.client.getThreadsPrivate(this.id)
    }

    getThreadsPublic() {
        return this.client.getThreadsPublic(this.id)
    }
}


module.exports = ThreadChannel
