"use strict";

const Base = require("./Base");
const Endpoints = require("../rest/Endpoints.js");

/**
* Represents a GuildPreview structure
* @extends Base
* @prop {Number} approximateMemberCount The **approximate** number of members in the guild
* @prop {Number} approximatePresenceCount The **approximate** number of presences in the guild
* @prop {String?} description The description for the guild (VIP only)
* @prop {String?} discoverySplash The description for the guild (VIP only)
* @prop {Array<Object>} emojis An array of guild emoji objects
* @prop {Array<String>} features An array of guild feature strings
* @prop {String?} icon The hash of the guild icon, or null if no icon
* @prop {String?} iconURL The URL of the guild's icon
* @prop {String} id The ID of the guild
* @prop {String} name The name of the guild
* @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
* @prop {String?} splashURL The URL of the guild's splash image
*/
class GuildPreview extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;

        this.name = data.name;
        this.icon = data.icon;
        this.description = data.description;
        this.splash = data.splash;
        this.discoverySplash = data.discovery_splash;
        this.features = data.features;
        this.approximateMemberCount = data.approximate_member_count;
        this.approximatePresenceCount = data.approximate_presence_count;
        this.emojis = data.emojis;
    }

    get iconURL() {
        return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon)) : null;
    }

    get splashURL() {
        return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash)) : null;
    }

    /**
    * Get the guild's splash with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicDiscoverySplashURL(format, size) {
        return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size) : null;
    }

    /**
    * Get the guild's icon with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicIconURL(format, size) {
        return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon), format, size) : null;
    }

    /**
    * Get the guild's splash with the given format and size
    * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
    * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
    */
    dynamicSplashURL(format, size) {
        return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash), format, size) : null;
    }

    toJSON(props = []) {
        return super.toJSON([
            "id",
            "name",
            "icon",
            "description",
            "splash",
            "discoverySplash",
            "features",
            "approximateMemberCount",
            "approximatePresenceCount",
            "emojis",
            ...props
        ]);
    }
}

module.exports = GuildPreview;
