"use strict";

/**
* Represents an command framework command
* @prop {Object} subcommands Object mapping subcommand labels to Command objects
*/
class Command {
    /**
    * Register a command
    * @arg {String} label The command label
    * @arg {Function | String | Array<Function | String>} generator A response string, array of functions or strings, or function that generates a string or array of strings when called.
    * If a function is passed, the function will be passed a Message object and an array of command arguments. The Message object will have an additional property `prefix`, which is the prefix used in the command.
    * `generator(msg, args)`
    * @arg {Object} [options] Command options
    * @arg {Array<String>} [options.aliases] An array of command aliases
    * @arg {Boolean} [options.caseInsensitive=false] Whether the command label (and aliases) is case insensitive or not
    * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user command message or not
    * @arg {Boolean} [options.argsRequired=false] If arguments are required or not
    * @arg {Boolean} [options.guildOnly=false] Whether to prevent the command from being used in Direct Messages or not
    * @arg {Boolean} [options.dmOnly=false] Whether to prevent the command from being used in guilds or not
    * @arg {String} [options.description="No description"] A short description of the command to show in the default help command
    * @arg {String} [options.fullDescription="No full description"] A detailed description of the command to show in the default help command
    * @arg {String} [options.usage] Details on how to call the command to show in the default help command
    * @arg {Object} [options.requirements] A set of factors that limit who can call the command
    * @arg {Array<String>} [options.requirements.userIDs] An array of user IDs representing users that can call the command
    * @arg {Object} [options.requirements.permissions] An object containing permission keys the user must match to use the command
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }
    * ```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the command
    * @arg {Array<String>} [options.requirements.roleIDs] An array of role IDs that would allow a user to use the command
    * @arg {Array<String>} [options.requirements.roleNames] An array of role names that would allow a user to use the command
    * @arg {Number} [options.cooldown] The cooldown between command usage in milliseconds
    * @arg {String} [options.cooldownMessage] A message to show when the command is on cooldown
    * @arg {String} [options.permissionMessage] A message to show when the user doesn't have permissions to use the command
    * @arg {String} [options.errorMessage] A message to show if the execution of the command handler somehow fails.
    * @arg {Array<{emoji: String, type: String, response: Function | String | Array<Function | String>}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function
    * @arg {Number} [options.reactionButtonTimeout=60000] Time (in milliseconds) to wait before invalidating the command's reaction buttons
    * @arg {Object} [options.defaultSubcommandOptions={}] Default subcommand options. This object takes the same options as a normal Command
    */
    constructor(label, generator, options) {
        this.label = label;
        this.description = options.description || "No description";
        this.fullDescription = options.fullDescription || "No full description";
        this.usage = options.usage || "";
        this.aliases = options.aliases || [];
        this.caseInsensitive = !!options.caseInsensitive;
        this.requirements = options.requirements || {};
        if(!this.requirements.userIDs) {
            this.requirements.userIDs = [];
        }
        if(!this.requirements.permissions) {
            this.requirements.permissions = {};
        }
        if(!this.requirements.roleIDs) {
            this.requirements.roleIDs = [];
        }
        if(!this.requirements.roleNames) {
            this.requirements.roleNames = [];
        }
        this.deleteCommand = !!options.deleteCommand;
        this.argsRequired = !!options.argsRequired;
        this.guildOnly = !!options.guildOnly;
        this.dmOnly = !!options.dmOnly;
        this.cooldown = options.cooldown || 0;
        this.cooldownMessage = options.cooldownMessage || false;
        this.permissionMessage = options.permissionMessage || false;
        this.errorMessage = options.errorMessage || "";
        this.reactionButtons = options.reactionButtons ? options.reactionButtons.map((button, index) => {
            if(typeof button.response === "string") {
                button.execute = () => button.response;
                return button;
            } else if(Array.isArray(button.response)) {
                button.responses = button.response.map((item, otherIndex) => {
                    if(typeof item === "string") {
                        return () => item;
                    } else if(typeof item === "function") {
                        return item;
                    } else {
                        throw new Error(`Invalid reaction button response generator (index ${index}:${otherIndex})`);
                    }
                });
                button.execute = () => button.responses[Math.floor(Math.random() * button.responses.length)]();
                return button;
            } else if(typeof button.response === "function") {
                button.execute = button.response;
                return button;
            } else if(button.type === "cancel") {
                return button;
            } else {
                throw new Error("Invalid reaction button response generator (index " + index + ")");
            }
        }) : null;
        this.reactionButtonTimeout = options.reactionButtonTimeout || 60000;
        if(this.cooldown !== 0) {
            this.usersOnCooldown = new Set();
        }
        if(typeof generator === "string") {
            this.response = generator;
            this.execute = () => this.response;
        } else if(Array.isArray(generator)) {
            this.responses = generator.map((item, index) => {
                if(typeof item === "string") {
                    return () => item;
                } else if(typeof item === "function") {
                    return item;
                } else {
                    throw new Error("Invalid command response generator (index " + index + ")");
                }
            });
            this.execute = () => this.responses[Math.floor(Math.random() * this.responses.length)];
        } else if(typeof generator === "function") {
            this.execute = generator;
        } else {
            throw new Error("Invalid command response generator");
        }
        this.defaultSubcommandOptions = options.defaultSubcommandOptions || {};

        this.subcommands = {};
        this.subcommandAliases = {};
    }

    permissionCheck(msg) {
        var req = false;
        if(this.requirements.userIDs.length > 0) {
            req = true;
            if(~this.requirements.userIDs.indexOf(msg.author.id)) {
                return true;
            }
        }
        if(!msg.channel.guild) {
            return !this.guildOnly && !req;
        } else if(this.dmOnly) {
            return false;
        }
        var keys = Object.keys(this.requirements.permissions);
        if(keys.length > 0) {
            req = true;
            var permissions = msg.channel.permissionsOf(msg.author.id).json;
            for(var key of keys) {
                if(this.requirements.permissions[key] !== permissions[key]) {
                    req = false;
                    break;
                }
            }
            if(req) {
                return true;
            }
            req = true;
        }
        if(msg.member) {
            var roles = msg.member.roles || [];
            if(this.requirements.roleIDs.length > 0) {
                req = true;
                for(var roleID of this.requirements.roleIDs) {
                    if(~roles.indexOf(roleID)) {
                        return true;
                    }
                }
            }
            if(this.requirements.roleNames.length > 0) {
                req = true;
                roles = roles.map((roleID) => msg.channel.guild.roles.get(roleID).name);
                for(var roleName of this.requirements.roleNames) {
                    if(~roles.indexOf(roleName)) {
                        return true;
                    }
                }
            }
        }
        return !req;
    }

    cooldownCheck(userID) {
        if(this.usersOnCooldown.has(userID)) {
            return false;
        }
        this.usersOnCooldown.add(userID);
        setTimeout(() => {
            this.usersOnCooldown.delete(userID);
        }, this.cooldown);
        return true;
    }

    process(args, msg) {
        var shouldDelete = this.deleteCommand && msg.channel.guild && msg.channel.permissionsOf(msg._client.user.id).has("manageMessages");
        if(!this.permissionCheck(msg)) {
            if(this.permissionMessage) {
                msg.channel.createMessage(this.permissionMessage);
            }
            if(shouldDelete) {
                msg.delete();
            }
            return;
        }
        if(args.length === 0) {
            if(this.argsRequired) {
                msg.channel.createMessage(`Invalid usage. Do \`${msg.prefix}help ${this.label}\` to view proper usage.`);
                if(shouldDelete) {
                    msg.delete();
                }
                return;
            }
            if(this.cooldown !== 0 && !this.cooldownCheck(msg.author.id)) {
                if(this.cooldownMessage) {
                    msg.channel.createMessage(this.cooldownMessage);
                }
                if(shouldDelete) {
                    msg.delete();
                }
                return;
            }
            if(shouldDelete) {
                msg.delete();
            }
            return this.execute(msg, args);
        }
        var label = this.subcommandAliases[args[0]] || args[0];
        var subcommand;
        if((subcommand = this.subcommands[label]) !== undefined || ((subcommand = this.subcommands[label.toLowerCase()]) !== undefined && subcommand.caseInsensitive)) {
            return subcommand.process(args.slice(1), msg);
        } else {
            if(this.cooldown !== 0 && !this.cooldownCheck(msg.author.id)) {
                if(this.cooldownMessage) {
                    msg.channel.createMessage(this.cooldownMessage);
                }
                return;
            }
            if(shouldDelete) {
                msg.delete();
            }
            return this.execute(msg, args);
        }
    }

    /**
    * Register an alias for a subcommand
    * @arg {String} alias The alias
    * @arg {String} label The original subcommand label
    */
    registerSubcommandAlias(alias, label) {
        if(!this.subcommands[label]) {
            throw new Error("No subcommand registered for " + label);
        }
        if(this.subcommandAliases[alias]) {
            throw new Error(`Alias ${label} already registered`);
        }
        this.subcommandAliases[alias] = label;
        this.subcommands[label].aliases.push(alias);
    }

    /**
    * Register a subcommand
    * @arg {String} label The subcommand label
    * @arg {Function | String | Array<Function | String>} generator A response string, array of functions or strings, or function that generates a string or array of strings when called.
    * If a function is passed, the function will be passed a Message object and an array of subcommand arguments. The Message object will have an additional property `prefix`, which is the prefix used in the subcommand.
    * `generator(msg, args)`
    * @arg {Object} [options] Command options
    * @arg {Array<String>} [options.aliases] An array of subcommand aliases
    * @arg {Boolean} [options.caseInsensitive=false] Whether the subcommand label (and aliases) is case insensitive or not
    * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user subcommand message or not
    * @arg {Boolean} [options.argsRequired=false] If arguments are required or not
    * @arg {Boolean} [options.guildOnly=false] Whether to prevent the subcommand from being used in Direct Messages or not
    * @arg {Boolean} [options.dmOnly=false] Whether to prevent the subcommand from being used in guilds or not
    * @arg {String} [options.description="No description"] A short description of the subcommand to show in the default help subcommand
    * @arg {String} [options.fullDescription="No full description"] A detailed description of the subcommand to show in the default help subcommand
    * @arg {String} [options.usage] Details on how to call the subcommand to show in the default help subcommand
    * @arg {Object} [options.requirements] A set of factors that limit who can call the subcommand
    * @arg {Array<String>} [options.requirements.userIDs] An array of user IDs representing users that can call the subcommand
    * @arg {Object} [options.requirements.permissions] An object containing permission keys the user must match to use the subcommand
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the subcommand
    * @arg {Array<String>} [options.requirements.roleIDs] An array of role IDs that would allow a user to use the subcommand
    * @arg {Array<String>} [options.requirements.roleNames] An array of role names that would allow a user to use the subcommand
    * @arg {Number} [options.cooldown] The cooldown between subcommand usage in milliseconds
    * @arg {String} [options.cooldownMessage] A message to show when the subcommand is on cooldown
    * @arg {String} [options.permissionMessage] A message to show when the user doesn't have permissions to use the command
    * @arg {String} [options.errorMessage] A message to show if the execution of the command handler somehow fails.
    * @arg {Array<{emoji: String, type: String, response: Function | String | Array<Function | String>}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function
    * @arg {Number} [options.reactionButtonTimeout=60000] Time (in milliseconds) to wait before invalidating the command's reaction buttons
    * @arg {Object} [options.defaultSubcommandOptions={}] Default subcommand options. This object takes the same options as a normal Command
    * @returns {Command}
    */
    registerSubcommand(label, generator, options) {
        if(label.includes(" ")) {
            throw new Error("Subcommand label may not have spaces");
        }
        if(this.subcommands[label]) {
            throw new Error("You have already registered a subcommand for " + label);
        }
        options = options || {};
        options.defaultSubcommandOptions = options.defaultSubcommandOptions || {};
        for(var key in this.defaultSubcommandOptions) {
            if(options[key] === undefined) {
                options[key] = this.defaultSubcommandOptions[key];
                options.defaultSubcommandOptions[key] = this.defaultSubcommandOptions[key];
            }
        }
        this.subcommands[label] = new Command(label, generator, options);
        if(options.aliases) {
            options.aliases.forEach((alias) => {
                this.subcommandAliases[alias] = label;
            });
        }
        return this.subcommands[label];
    }

    /**
    * Unregister a subcommand
    * @arg {String} label The subcommand label
    */
    unregisterSubcommand(label) {
        var original = this.subcommandAliases[label];
        if(original) {
            this.subcommands[original].aliases.splice(this.subcommands[original].aliases.indexOf(label), 1);
            delete this.subcommandAliases[label];
        } else {
            delete this.subcommands[label];
        }
    }
}

module.exports = Command;
