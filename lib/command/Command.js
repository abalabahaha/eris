"use strict";

const Base = require("../structures/Base");

/**
* Represents an command framework command
* @prop {Array<String>} aliases An array of command aliases
* @prop {Boolean} argsRequired If arguments are required or not
* @prop {Boolean} caseInsensitive Whether the command label (and aliases) is case insensitive or not
* @prop {Number} cooldown The cooldown between command usage in milliseconds
* @prop {Object} cooldownExclusions A set of factors that limit where cooldowns are active
* @prop {Function | String} cooldownMessage A string or a function that returns a string to show when the command is on cooldown.
* @prop {Number} cooldownReturns Number of times to return a message when the command is used during it's cooldown.
* @prop {Object} defaultSubcommandOptions Default subcommand options.
* @prop {Boolean} deleteCommand Whether to delete the user command message or not
* @prop {String} description A short description of the command
* @prop {Boolean} dmOnly Whether the command is prevented from being used in guilds or not
* @prop {Function | String} errorMessage A string or a function that returns a string to show if the execution of the command handler somehow fails.  The function is passed the Message object as a parameter.
* @prop {String} fullDescription A detailed description of the command
* @prop {String} fullLabel The full command label
* @prop {Boolean} guildOnly Whether the command is prevented from being used in Direct Messages or not
* @prop {Boolean} hidden Whether or not the command is hidden from the default help command list.
* @prop {Object} hooks A set of functions to be executed at different times throughout the command's processing
* @prop {Function | String} invalidUsageMessage A string or a function that returns a string to show when a command was improperly used.
* @prop {String} label The command label
* @prop {Command?} parentCommand If this command is also a subcommand, this will refer to its parent Command
* @prop {Function | String} permissionMessage A string or a function that returns a string to show when the user doesn't have permissions to use the command.
* @prop {Object?} reactionButtons An array of objects specifying reaction buttons, or null if no reaction buttons.
* @prop {Number} reactionButtonTimeout Time (in milliseconds) to wait before invalidating the command's reaction buttons
* @prop {Object} requirements A set of factors that limit who can call the command
* @prop {Boolean} restartCooldown Whether or not to restart a command's cooldown every time it's used
* @prop {Object} subcommands Object mapping subcommand labels to Command objects
* @prop {Object} subcommandAliases Object mapping subcommand aliases to Command objects
* @prop {String} usage Details on how to call the command to show in the default help command
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
    * @arg {Boolean} [options.argsRequired=false] If arguments are required or not
    * @arg {Boolean} [options.caseInsensitive=false] Whether the command label (and aliases) is case insensitive or not
    * @arg {Number} [options.cooldown] The cooldown between command usage in milliseconds
    * @arg {Object} [options.cooldownExclusions={}] A set of factors that limit where cooldowns are active
    * @arg {Array<String>} [options.cooldownExclusions.userIDs] An array of user IDs representing users that are not affected by cooldowns.
    * @arg {Array<String>} [options.cooldownExclusions.guildIDs] An array of guild IDs representing guilds that are not affected by cooldowns.
    * @arg {Array<String>} [options.cooldownExclusions.channelIDs] An array of channel IDs representing channels that are not affected by cooldowns.
    * @arg {Function | String} [options.cooldownMessage] A string or a function that returns a string to show when the command is on cooldown.  The function is passed the Message object as a parameter.
    * @arg {Number} [option.cooldownReturns=0] Number of times to return a message when the command is used during it's cooldown.  Once the cooldown expires this is reset.  Set this to 0 to always return a message.
    * @arg {Object} [options.defaultSubcommandOptions={}] Default subcommand options. This object takes the same options as a normal Command
    * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user command message or not
    * @arg {String} [options.description="No description"] A short description of the command to show in the default help command
    * @arg {Boolean} [options.dmOnly=false] Whether to prevent the command from being used in guilds or not
    * @arg {Function | String} [options.errorMessage] A string or a function that returns a string to show if the execution of the command handler somehow fails.  The function is passed the Message object as a parameter.
    * @arg {String} [options.fullDescription="No full description"] A detailed description of the command to show in the default help command
    * @arg {Boolean} [options.guildOnly=false] Whether to prevent the command from being used in Direct Messages or not
    * @arg {Boolean} [options.hidden=false] Whether or not the command should be hidden from the default help command list.
    * @arg {Object} [options.hooks] A set of functions to be executed at different times throughout the command's processing
    * @arg {Function} [options.hooks.preCommand] A function that is executed before any permission or cooldown checks is made. The function is passed the command message and arguments as parameters.
    * @arg {Function} [options.hooks.postCheck] A function that is executed after all checks have cleared, but before the command is executed. The function is passed the command message, arguments, and if command checks were passed as parameters.
    * @arg {Function} [options.hooks.postExecution] A function that is executed after the command is executed, regardless of the final failed state of the command. The function is passed the command message, arguments, and if execution succeeded as parameters.
    * @arg {Function} [options.hooks.postCommand] A function that is executed after a response has been posted, and the command has finished processing. The function is passed the command message, arguments, and the response message (if applicable) as parameters.
    * @arg {Function | String} [options.invalidUsageMessage] A string or a function that returns a string to show when a command was improperly used.  The function is passed the Message object as a parameter.
    * @arg {Function | String} [options.permissionMessage] A string or a function that returns a string to show when the user doesn't have permissions to use the command.  The function is passed the Message object as a parameter.
    * @arg {Array<{emoji: String, type: String, response: (Function | String | Array<Function | String>), filter: Function}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function, but with an extra userID parameter for generator functions (`function(msg, args, userID)`) describing the user that made the reaction
    * `filter` specifies a function (`function(msg, emoji, userID)`) that filters message reactions. If the function returns false, the reaction is not treated as a valid reaction button response
    * @arg {Number} [options.reactionButtonTimeout=60000] Time (in milliseconds) to wait before invalidating the command's reaction buttons
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
    * @arg {Function} [options.requirements.custom] A function that accepts a message and returns true if the command should be run
    * @arg {Boolean} [option.restartCooldown=false] Whether or not to restart a command's cooldown every time it's used.
    * @arg {String} [options.usage] Details on how to call the command to show in the default help command
    */
    constructor(label, generator, options, parentCommand) {
        this.parentCommand = parentCommand;
        this.label = label;
        this.description = options.description || "No description";
        this.fullDescription = options.fullDescription || "No full description";
        this.usage = options.usage || "";
        this.aliases = options.aliases || [];
        this.caseInsensitive = !!options.caseInsensitive;
        this.hooks = options.hooks || {};
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
        this.cooldownExclusions = options.cooldownExclusions || {};
        if(!this.cooldownExclusions.userIDs) {
            this.cooldownExclusions.userIDs = [];
        }
        if(!this.cooldownExclusions.guildIDs) {
            this.cooldownExclusions.guildIDs = [];
        }
        if(!this.cooldownExclusions.channelIDs) {
            this.cooldownExclusions.channelIDs = [];
        }
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
                throw new Error(`Invalid reaction button response generator (index ${index})`);
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
                    throw new Error(`Invalid command response generator (index ${index})`);
                }
            });
            this.execute = () => this.responses[Math.floor(Math.random() * this.responses.length)]();
        } else if(typeof generator === "function") {
            this.execute = generator;
        } else {
            throw new Error("Invalid command response generator");
        }
        this.defaultSubcommandOptions = options.defaultSubcommandOptions || {};

        this.subcommands = {};
        this.subcommandAliases = {};
        this.hidden = !!options.hidden;
    }

    get fullLabel() {
        return `${this.parentCommand ? this.parentCommand.fullLabel + " " : ""}${this.label}`;
    }

    cooldownCheck(msg) {
        // Verify the msg isn't excluded from cooldown checks
        if(this.cooldownExclusionCheck(msg)) {
            return true;
        }

        const userID = msg.author.id;
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
        } else {
            setTimeout(() => {
                this.usersOnCooldown.delete(userID);
            }, this.cooldown);
        }
        return true;
    }

    cooldownExclusionCheck(msg) {
        return this.cooldownExclusions.channelIDs.includes(msg.channel.id) || this.cooldownExclusions.userIDs.includes(msg.author.id) || (msg.channel.guild && this.cooldownExclusions.guildIDs.includes(msg.channel.guild.id));
    }

    async executeCommand(msg, args) {
        if(this.hooks.postCheck) {
            const response = await Promise.resolve(this.hooks.postCheck(msg, args, true));
            if(response) {
                msg = response.msg || msg;
                args = response.args || args;
            }
        }

        const ret = this.execute(msg, args);

        if(this.hooks.postExecution) {
            this.hooks.postExecution(msg, args, true);
        }

        return ret;
    }

    async permissionCheck(msg) {
        if(this.requirements.custom) {
            if(typeof this.requirements.custom !== "function") {
                throw new Error("Custom requirement is not a function");
            }
            if(!(await this.requirements.custom(msg))) {
                return false;
            }
        }
        if(this.requirements.userIDs) {
            const userIDs = typeof this.requirements.userIDs === "function" ? await this.requirements.userIDs(msg) : this.requirements.userIDs;
            if(!Array.isArray(userIDs)) {
                throw new Error("User IDs requirement is not an array");
            }
            if(userIDs.length > 0 && !userIDs.includes(msg.author.id)) {
                return false;
            }
        }
        if(msg.channel.guild) {
            if(this.dmOnly) {
                return false;
            }
            if(this.requirements.permissions) {
                const requiredPermissions = Object.keys(typeof this.requirements.permissions === "function" ? await this.requirements.permissions(msg) : this.requirements.permissions);
                if(requiredPermissions.length > 0) {
                    const permissions = msg.channel.permissionsOf(msg.author.id);
                    for(const permission of requiredPermissions) {
                        if(!permissions.has(permission)) {
                            return false;
                        }
                    }
                }
            }
            const roleIDs = msg.member.roles || [];
            if(this.requirements.roleIDs) {
                const requiredRoleIDs = typeof this.requirements.roleIDs === "function" ? await this.requirements.roleIDs(msg) : this.requirements.roleIDs;
                if(!Array.isArray(requiredRoleIDs)) {
                    throw new Error("Role IDs requirement is not an array");
                }
                for(const roleID of requiredRoleIDs) {
                    if(!roleIDs.includes(roleID)) {
                        return false;
                    }
                }
            }
            if(this.requirements.roleNames) {
                const roleNames = roleIDs.map((roleID) => msg.channel.guild.roles.get(roleID).name);
                const requiredRoleNames = typeof this.requirements.roleNames === "function" ? await this.requirements.roleNames(msg) : this.requirements.roleNames;
                if(!Array.isArray(roleNames)) {
                    throw new Error("Role names requirement is not an array");
                }
                for(const roleName of requiredRoleNames) {
                    if(!roleNames.includes(roleName)) {
                        return false;
                    }
                }
            }
        } else if(this.guildOnly) {
            return false;
        }
        return true;
    }

    async process(args, msg) {
        const shouldDelete = this.deleteCommand && msg.channel.guild && msg.channel.permissionsOf(msg._client.user.id).has("manageMessages");

        if(this.hooks.preCommand) {
            const response = await Promise.resolve(this.hooks.preCommand(msg, args));
            if(response) {
                msg = response.msg || msg;
                args = response.args || args;
            }
        }

        let reply;
        if(this.cooldown !== 0 && !this.cooldownCheck(msg)) {
            if(this.hooks.postCheck) {
                const response = await Promise.resolve(this.hooks.postCheck(msg, args, true));
                if(response) {
                    msg = response.msg || msg;
                    args = response.args || args;
                }
            }
            if(this.cooldownMessage && (!this.cooldownReturns || this.cooldownAmounts[msg.author.id] <= this.cooldownReturns)) {
                reply = typeof this.cooldownMessage === "function" ? this.cooldownMessage(msg) : this.cooldownMessage;
                if(reply) {
                    msg.channel.createMessage(reply);
                }
            }
            return;
        }
        if(!await this.permissionCheck(msg)) {
            if(this.hooks.postCheck) {
                const response = await Promise.resolve(this.hooks.postCheck(msg, args, false));
                if(response) {
                    msg = response.msg || msg;
                    args = response.args || args;
                }
            }

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
                if(this.hooks.postCheck) {
                    const response = await Promise.resolve(this.hooks.postCheck(msg, args, true));
                    if(response) {
                        msg = response.msg || msg;
                        args = response.args || args;
                    }
                }
                reply = typeof this.invalidUsageMessage === "function" ? this.invalidUsageMessage(msg) : this.invalidUsageMessage;
                if(reply) {
                    msg.channel.createMessage(reply.replace(/%prefix%/g, msg.prefix).replace(/%label%/g, this.fullLabel));
                }
                return;
            }
            return this.executeCommand(msg, args);
        }
        const label = this.subcommandAliases[args[0]] || args[0];
        let subcommand;
        if((subcommand = this.subcommands[label]) !== undefined || ((subcommand = this.subcommands[label.toLowerCase()]) !== undefined && subcommand.caseInsensitive)) {
            msg.command = subcommand; // eslint-disable-line require-atomic-updates
            return subcommand.process(args.slice(1), msg);
        } else {
            if(shouldDelete) {
                msg.delete();
            }
            return this.executeCommand(msg, args);
        }
    }

    /**
    * Register a subcommand
    * @arg {String} label The subcommand label
    * @arg {Function | String | Array<Function | String>} generator A response string, array of functions or strings, or function that generates a string or array of strings when called.
    * If a function is passed, the function will be passed a Message object and an array of subcommand arguments. The Message object will have an additional property `prefix`, which is the prefix used in the subcommand.
    * `generator(msg, args)`
    * @arg {Object} [options] Command options
    * @arg {Array<String>} [options.aliases] An array of command aliases
    * @arg {Boolean} [options.argsRequired=false] If arguments are required or not
    * @arg {Boolean} [options.caseInsensitive=false] Whether the command label (and aliases) is case insensitive or not
    * @arg {Number} [options.cooldown] The cooldown between command usage in milliseconds
    * @arg {Object} [options.cooldownExclusions={}] A set of factors that limit where cooldowns are active
    * @arg {Array<String>} [options.cooldownExclusions.userIDs] An array of user IDs representing users that are not affected by cooldowns.
    * @arg {Array<String>} [options.cooldownExclusions.guildIDs] An array of guild IDs representing guilds that are not affected by cooldowns.
    * @arg {Array<String>} [options.cooldownExclusions.channelIDs] An array of channel IDs representing channels that are not affected by cooldowns.
    * @arg {Function | String} [options.cooldownMessage] A string or a function that returns a string to show when the command is on cooldown
    * @arg {Number} [option.cooldownReturns=0] Number of times to return a message when the command is used during it's cooldown.  Once the cooldown expires this is reset.  Set this to 0 to always return a message.
    * @arg {Object} [options.defaultSubcommandOptions={}] Default subcommand options. This object takes the same options as a normal Command
    * @arg {Boolean} [options.deleteCommand=false] Whether to delete the user command message or not
    * @arg {String} [options.description="No description"] A short description of the command to show in the default help command
    * @arg {Boolean} [options.dmOnly=false] Whether to prevent the command from being used in guilds or not
    * @arg {Function | String} [options.errorMessage] A string or a function that returns a string to show if the execution of the command handler somehow fails.
    * @arg {String} [options.fullDescription="No full description"] A detailed description of the command to show in the default help command
    * @arg {Boolean} [options.guildOnly=false] Whether to prevent the command from being used in Direct Messages or not
    * @arg {Boolean} [options.hidden=false] Whether or not the command should be hidden from the default help command list
    * @arg {Object} [options.hooks] A set of functions to be executed at different times throughout the command's processing
    * @arg {Function} [options.hooks.preCommand] A function that is executed before any permission or cooldown checks is made. The function is passed the command message and arguments as parameters.
    * @arg {Function} [options.hooks.postCheck] A function that is executed after all checks have cleared, but before the command is executed. The function is passed the command message, arguments, and if command checks were passed as parameters.
    * @arg {Function} [options.hooks.postExecution] A function that is executed after the command is executed, regardless of the final failed state of the command. The function is passed the command message, arguments, and if execution succeeded as parameters.
    * @arg {Function} [options.hooks.postCommand] A function that is executed after a response has been posted, and the command has finished processing. The function is passed the command message, arguments, and the response message (if applicable) as parameters.
    * @arg {Function | String} [options.invalidUsageMessage] A string or a function that returns a string to show when a command was improperly used
    * @arg {Function | String} [options.permissionMessage] A string or a function that returns a string to show when the user doesn't have permissions to use the command
    * @arg {Array<{emoji: String, type: String, response: (Function | String | Array<Function | String>)}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function, but with an extra userID parameter for generator functions (`function(msg, args, userID)`) describing the user that made the reaction
    * `filter` specifies a function (`function(msg, emoji, userID)`) that filters message reactions. If the function returns false, the reaction is not treated as a valid reaction button response
    * @arg {Number} [options.reactionButtonTimeout=60000] Time (in milliseconds) to wait before invalidating the command's reaction buttons
    * @arg {Object} [options.requirements] A set of factors that limit who can call the command
    * @arg {Function | Array<String>} [options.requirements.userIDs] An array or a function that returns an array of user IDs representing users that can call the command
    * @arg {Function | Object} [options.requirements.permissions] An object or a function that returns an object containing permission keys the user must match to use the command
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }
    * ```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the command
    * @arg {Function | Array<String>} [options.requirements.roleIDs] An array or a function that returns an array of role IDs that would allow a user to use the command
    * @arg {Function | Array<String>} [options.requirements.roleNames] An array or a function that returns an array of role names that would allow a user to use the command
    * @arg {Function} [options.requirements.custom] A function that accepts a message and returns true if the command should be run
    * @arg {Boolean} [option.restartCooldown=false] Whether or not to restart a command's cooldown every time it's used.
    * @arg {String} [options.usage] Details on how to call the command to show in the default help command
    * @returns {Command}
    */
    registerSubcommand(label, generator, options = {}) {
        if(label.includes(" ")) {
            throw new Error("Subcommand label may not have spaces");
        }
        if(this.subcommands[label]) {
            throw new Error("You have already registered a subcommand for " + label);
        }
        options.defaultSubcommandOptions = options.defaultSubcommandOptions || {};
        for(const key in this.defaultSubcommandOptions) {
            if(this.defaultSubcommandOptions.hasOwnProperty(key) && options[key] === undefined) {
                options[key] = this.defaultSubcommandOptions[key];
                options.defaultSubcommandOptions[key] = this.defaultSubcommandOptions[key];
            }
        }
        label = options.caseInsensitive === true ? label.toLowerCase() : label;
        this.subcommands[label] = new Command(label, generator, options, this);
        if(options.aliases) {
            options.aliases.forEach((alias) => {
                this.subcommandAliases[alias] = label;
            });
        }
        return this.subcommands[label];
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
    * Unregister a subcommand
    * @arg {String} label The subcommand label
    */
    unregisterSubcommand(label) {
        const original = this.subcommandAliases[label];
        if(original) {
            this.subcommands[original].aliases.splice(this.subcommands[original].aliases.indexOf(label), 1);
            delete this.subcommandAliases[label];
        } else {
            delete this.subcommands[label];
        }
    }

    toString() {
        return `[Command ${this.label}]`;
    }

    toJSON(props = []) {
        return Base.prototype.toJSON.call(this, [
            "parentCommand",
            "label",
            "description",
            "fullDescription",
            "usage",
            "aliases",
            "caseInsensitive",
            "hooks",
            "requirements",
            "deleteCommand",
            "argsRequired",
            "guildOnly",
            "dmOnly",
            "cooldown",
            "cooldownExclusions",
            "restartCooldown",
            "cooldownReturns",
            "cooldownMessage",
            "invalidUsageMessage",
            "permissionMessage",
            "errorMessage",
            "reactionButtons",
            "reactionButtonTimeout",
            "execute",
            "defaultSubcommandOptions",
            "subcommands",
            "subcommandAliases",
            "hidden",
            ...props
        ]);
    }
}

module.exports = Command;
