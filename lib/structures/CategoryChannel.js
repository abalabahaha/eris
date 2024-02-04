"use strict";

const Collection = require("../util/Collection");
const GuildChannel = require("./GuildChannel");
const PermissionOverwrite = require("./PermissionOverwrite");

class CategoryChannel extends GuildChannel {
    constructor(data, client) {
        super(data, client);
        this.permissionOverwrites = new Collection(PermissionOverwrite);
        this.update(data);
    }

    update(data) {
        super.update(data);
        if(data.position !== undefined) {
            this.position = data.position;
        }
        if(data.permission_overwrites !== undefined) {
            data.permission_overwrites.forEach((overwrite) => {
                this.permissionOverwrites.update(overwrite);
            });
        }
    }

    get channels() {
        const channels = new Collection(GuildChannel);
        if(this.guild && this.guild.channels) {
            for(const channel of this.guild.channels.values()) {
                if(channel.parentID === this.id) {
                    channels.add(channel);
                }
            }
        }
        return channels;
    }

    /**
     * Delete a channel permission overwrite
     * @arg {String} overwriteID The ID of the overwritten user or role
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    deletePermission(overwriteID, reason) {
        return this.client.deleteChannelPermission.call(this.client, this.id, overwriteID, reason);
    }

    /**
     * Edit a channel permission overwrite
     * @arg {String} overwriteID The ID of the overwritten user or role
     * @arg {BigInt | Number | String} allow The permissions number for allowed permissions
     * @arg {BigInt | Number | String} deny The permissions number for denied permissions
     * @arg {Number} type The object type of the overwrite, either 1 for "member" or 0 for "role"
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise<PermissionOverwrite>}
     */
    editPermission(overwriteID, allow, deny, type, reason) {
        return this.client.editChannelPermission.call(this.client, this.id, overwriteID, allow, deny, type, reason);
    }

    toJSON(props = []) {
        return super.toJSON([
            "permissionOverwrites",
            "position",
            ...props
        ]);
    }
}

module.exports = CategoryChannel;
