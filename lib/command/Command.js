"use strict";

/**
* Represents an command framework command
* @prop {Object} subcommands Object mapping subcommand labels to Command objects
* @prop {Command?} parentCommand If this command is also a subcommand, this will refer to its parent Command
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
    * @arg {Function | Array<String>} [options.requirements.userIDs] An array or a function that returns an array of user IDs representing users that can call the command.  The function is passed the Message object as a parameter.
    * @arg {Function | Object} [options.requirements.permissions] An object or a function that returns an object containing permission keys the user must match to use the command.  The function is passed the Message object as a parameter.
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }
    * ```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the command
    * @arg {Function | Array<String>} [options.requirements.roleIDs] An array or a function that returns an array of role IDs that would allow a user to use the command.  The function is passed the Message object as a parameter.
    * @arg {Function | Array<String>} [options.requirements.roleNames] An array or a function that returns an array of role names that would allow a user to use the command.  The function is passed the Message object as a parameter.
    * @arg {Number} [options.cooldown] The cooldown between command usage in milliseconds
    * @arg {Boolean} [option.restartCooldown=false] Whether or not to restart a command's cooldown every time it's used.
    * @arg {Number} [option.cooldownReturns=0] Number of times to return a message when the command is used during it's cooldown.  Once the cooldown expires this is reset.  Set this to 0 to always return a message.
    * @arg {Function | String} [options.cooldownMessage] A string or a function that returns a string to show when the command is on cooldown.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.invalidUsageMessage] A string or a function that returns a string to show when a command was improperly used.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.permissionMessage] A string or a function that returns a string to show when the user doesn't have permissions to use the command.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.errorMessage] A string or a function that returns a string to show if the execution of the command handler somehow fails.  The function is passed the Message object as a parameter.
    * @arg {Array<{emoji: String, type: String, response: Function | String | Array<Function | String>}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function
    * @arg {Number} [options.reactionButtonTimeout=60000] Time (in milliseconds) to wait before invalidating the command's reaction buttons
    * @arg {Object} [options.defaultSubcommandOptions={}] Default subcommand options. This object takes the same options as a normal Command
    */
    constructor(label, generator, options, parentCommand) {
        this.parentCommand = parentCommand;
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
        this.deleteCommand = !!options.deleteCommand;
        this.argsRequired = !!options.argsRequired;
        this.guildOnly = !!options.guildOnly;
        this.dmOnly = !!options.dmOnly;
        this.cooldown = options.cooldown || 0;
        this.restartCooldown = !!options.restartCooldown;
        this.cooldownReturns = options.cooldownReturns || 0;
        this.cooldownMessage = options.cooldownMessage || false;
        this.invalidUsageMessage = options.invalidUsageMessage || false;
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
            if(this.restartCooldown) {
                this.cooldownTimeouts = {};
            }
            if(this.cooldownReturns) {
                this.cooldownAmounts = {};
            }
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

    get fullLabel() {
        if(this.parentCommand) {
            return this.parentCommand.fullLabel + " " + this.label;
        } else {
            return this.label;
        }
    }

    permissionCheck(msg) {
        var req = false;
        if(typeof this.requirements.userIDs === "function") {
            req = true;
            if(~this.requirements.userIDs(msg).indexOf(msg.author.id)) {
                return true;
            }
        } else if(this.requirements.userIDs.length > 0) {
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
        var keys = typeof this.requirements.permissions === "function" ? Object.keys(this.requirements.permissions(msg)) : Object.keys(this.requirements.permissions);
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
            if(this.requirements.roleIDs) {
                req = true;
                var requiredRoleIDs = this.requirements.roleIDs;
                if(typeof requiredRoleIDs === "function") {
                    requiredRoleIDs = this.requirements.roleIDs(msg);
                }
                for(var roleID of requiredRoleIDs) {
                    if(~roles.indexOf(roleID)) {
                        return true;
                    }
                }
            }
            if(this.requirements.roleNames) {
                req = true;
                roles = roles.map((roleID) => msg.channel.guild.roles.get(roleID).name);
                var requiredRoleNames = this.requirements.roleNames;
                if(typeof requiredRoleNames === "function") {
                    requiredRoleNames = this.requirements.roleNames(msg);
                }
                for(var roleName of requiredRoleNames) {
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
            if(this.cooldownReturns) {
                this.cooldownAmounts[userID]++;
            }
            if(this.restartCooldown) {
                clearTimeout(this.cooldownTimeouts[userID]);
                this.cooldownTimeouts[userID] = setTimeout(() => {
                    this.usersOnCooldown.delete(userID);
                }, this.cooldown);
            }
            return false;
        }
        if(this.cooldownReturns) {
            this.cooldownAmounts[userID] = 0;
        }
        this.usersOnCooldown.add(userID);
        if(this.restartCooldown) {
            this.cooldownTimeouts[userID] = setTimeout(() => {
                this.usersOnCooldown.delete(userID);
            }, this.cooldown);
        } else{
            setTimeout(() => {
                this.usersOnCooldown.delete(userID);
            }, this.cooldown);
        }
        return true;
    }

    process(args, msg) {
        var shouldDelete = this.deleteCommand && msg.channel.guild && msg.channel.permissionsOf(msg._client.user.id).has("manageMessages");
        var reply;
        if(!this.permissionCheck(msg)) {
            if(shouldDelete) {
                msg.delete();
            }
            reply = typeof this.permissionMessage === "function" ? this.permissionMessage(msg) : this.permissionMessage;
            if(reply) {
                msg.channel.createMessage(reply);
            }
            return;
        }
        if(args.length === 0) {
            if(shouldDelete) {
                msg.delete();
            }
            if(this.argsRequired) {
                reply = typeof this.invalidUsageMessage === "function" ? this.invalidUsageMessage(msg) : this.invalidUsageMessage;
                if(reply) {
                    msg.channel.createMessage(reply.replace(/%prefix%/g, msg.prefix).replace(/%label%/g, this.fullLabel));
                }
                return;
            }
            if(this.cooldown !== 0 && !this.cooldownCheck(msg.author.id)) {
                if(this.cooldownMessage && (!this.cooldownReturns || this.cooldownAmounts[msg.author.id] <= this.cooldownReturns)) {
                    reply = typeof this.cooldownMessage === "function" ? this.cooldownMessage(msg) : this.cooldownMessage;
                    if(reply) {
                        msg.channel.createMessage(reply);
                    }
                }
                return;
            }
            return this.execute(msg, args);
        }
        var label = this.subcommandAliases[args[0]] || args[0];
        var subcommand;
        if((subcommand = this.subcommands[label]) !== undefined || ((subcommand = this.subcommands[label.toLowerCase()]) !== undefined && subcommand.caseInsensitive)) {
            msg.command = subcommand;
            return subcommand.process(args.slice(1), msg);
        } else {
            if(shouldDelete) {
                msg.delete();
            }
            if(this.cooldown !== 0 && !this.cooldownCheck(msg.author.id)) {
                if(this.cooldownMessage && (!this.cooldownReturns || this.cooldownAmounts[msg.author.id] <= this.cooldownReturns)) {
                    reply = typeof this.cooldownMessage === "function" ? this.cooldownMessage(msg) : this.cooldownMessage;
                    if(reply) {
                        msg.channel.createMessage(reply);
                    }
                }
                return;
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
    * @arg {Function | Array<String>} [options.requirements.userIDs] An array or a function that returns an array of user IDs representing users that can call the subcommand
    * @arg {Function | Object} [options.requirements.permissions] An object or a function that returns an object containing permission keys the user must match to use the subcommand
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the subcommand
    * @arg {Function | Array<String>} [options.requirements.roleIDs] An array or a function that returns an array of role IDs that would allow a user to use the subcommand
    * @arg {Function | Array<String>} [options.requirements.roleNames] An array or a function that returns an array of role names that would allow a user to use the subcommand
    * @arg {Number} [options.cooldown] The cooldown between subcommand usage in milliseconds
    * @arg {Boolean} [option.restartCooldown=false] Whether or not to restart a command's cooldown every time it's used.
    * @arg {Number} [option.cooldownReturns=0] Number of times to return a message when the command is used during it's cooldown.  Once the cooldown expires this is reset.  Set this to 0 to always return a message.
    * @arg {Function | String} [options.cooldownMessage] A string or a function that returns a string to show when the command is on cooldown.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.invalidUsageMessage] A string or a function that returns a string to show when a command was improperly used.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.permissionMessage] A string or a function that returns a string to show when the user doesn't have permissions to use the command.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.errorMessage] A string or a function that returns a string to show if the execution of the command handler somehow fails.  The function is passed the Message object as a parameter.
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
        this.subcommands[label] = new Command(label, generator, options, this);
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
