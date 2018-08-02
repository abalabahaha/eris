"use strict";

const Client = require("../Client");
const Command = require("./Command");
const Message = require("../structures/Message");

/**
* Represents an Eris client with the command framework
* @extends Client
* @prop {Object} commandAliases Object mapping command label aliases to command labels
* @prop {Object} commands Object mapping command labels to Command objects
* @prop {Object} guildPrefixes Object mapping guild IDs to arrays of guild-specific prefixes
*/
class CommandClient extends Client {
    /**
    * Create a CommandClient
    * @arg {String} token bot token
    * @arg {Object} [options] Eris options (same as Client)
    * @arg {Object} [commandOptions] Command options
    * @arg {Boolean} [commandOptions.defaultHelpCommand=true] Whether to register the default help command or not
    * @arg {String} [commandOptions.description="An Eris-based Discord bot"] The description to show in the default help command
    * @arg {Boolean} [commandOptions.ignoreBots=true] Whether to ignore bot accounts or not
    * @arg {Boolean} [commandOptions.ignoreSelf=true] Whether to ignore the bot's own account or not
    * @arg {String} [commandOptions.name="<Bot username>"] The bot name to show in the default help command
    * @arg {String} [commandOptions.owner="an unknown user"] The owner to show in the default help command
    * @arg {String|Array} [commandOptions.prefix="@mention "] The bot prefix. Can be either an array of prefixes or a single prefix. "@mention" will be automatically replaced with the bot's actual mention
    * @arg {Object} [commandOptions.defaultCommandOptions={}] Default command options. This object takes the same options as a normal Command
    */
    constructor(token, options, commandOptions) {
        super(token, options);
        this.commandOptions = {
            defaultHelpCommand: true,
            description: "An Eris-based Discord bot",
            ignoreBots: true,
            ignoreSelf: true,
            name: null,
            owner: "an unknown user",
            prefix: "@mention ",
            defaultCommandOptions: {}
        };
        if(typeof commandOptions === "object") {
            for(const property of Object.keys(commandOptions)) {
                this.commandOptions[property] = commandOptions[property];
            }
        }
        this.guildPrefixes = {};
        this.commands = {};
        this.commandAliases = {};
        this.activeMessages = {};

        this.once("shardPreReady", () => {
            this.preReady = true;
            if(!this.commandOptions.name) {
                this.commandOptions.name = `**${this.user.username}**`;
            }
            if(Array.isArray(this.commandOptions.prefix)){
                for(const i in this.commandOptions.prefix){
                    this.commandOptions.prefix[i] = this.commandOptions.prefix[i].replace(/@mention/g, this.user.mention);
                }
            } else {
                this.commandOptions.prefix = this.commandOptions.prefix.replace(/@mention/g, this.user.mention);
            }
            for(const key in this.guildPrefixes) {
                if(!this.guildPrefixes.hasOwnProperty(key)) {
                    continue;
                }
                if(Array.isArray(this.guildPrefixes[key])){
                    for(const i in this.guildPrefixes[key]){
                        this.guildPrefixes[key][i] = this.guildPrefixes[key][i].replace(/@mention/g, this.user.mention);
                    }
                } else {
                    this.guildPrefixes[key] = this.guildPrefixes[key].replace(/@mention/g, this.user.mention);
                }
            }
        });

        this.on("messageCreate", this.onMessageCreate);

        this.on("messageReactionAdd", this.onMessageReactionEvent);
        this.on("messageReactionRemove", this.onMessageReactionEvent);

        if(this.commandOptions.defaultHelpCommand) {
            this.registerCommand("help", (msg, args) => {
                let result = "";
                if(args.length > 0) {
                    let cur = this.commands[this.commandAliases[args[0]] || args[0]];
                    if(!cur) {
                        return "Command not found";
                    }
                    let {label} = cur;
                    for(let i = 1; i < args.length; ++i) {
                        cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
                        if(!cur) {
                            return "Command not found";
                        }
                        label += " " + cur.label;
                    }
                    result += `**${msg.prefix}${label}** ${cur.usage}\n${cur.fullDescription}`;
                    if(Object.keys(cur.aliases).length > 0) {
                        result += `\n\n**Aliases:** ${cur.aliases.join(", ")}`;
                    }
                    if(Object.keys(cur.subcommands).length > 0) {
                        result += "\n\n**Subcommands:**";
                        for(const subLabel in cur.subcommands) {
                            if(cur.subcommands.hasOwnProperty(subLabel) && cur.subcommands[subLabel].permissionCheck(msg)) {
                                result += `\n  **${subLabel}** - ${cur.subcommands[subLabel].description}`;
                            }
                        }
                    }
                } else {
                    result += `${this.commandOptions.name} - ${this.commandOptions.description}\n`;
                    if(this.commandOptions.owner) {
                        result += `by ${this.commandOptions.owner}\n`;
                    }
                    result += "\n";
                    result += "**Commands:**\n";
                    for(const label in this.commands) {
                        if(this.commands.hasOwnProperty(label) && this.commands[label] && this.commands[label].permissionCheck(msg) && !this.commands[label].hidden) {
                            result += `  **${msg.prefix}${label}** - ${this.commands[label].description}\n`;
                        }
                    }
                    result += `\nType ${msg.prefix}help <command> for more info on a command.`;
                }
                return result;
            }, {
                description: "This help text",
                fullDescription: "This command is used to view information of different bot commands, including this one."
            });
            if(!this.commandOptions.defaultCommandOptions.invalidUsageMessage) {
                this.commandOptions.defaultCommandOptions.invalidUsageMessage = "Invalid usage. Do `%prefix%help %label%` to view proper usage.";
            }
        } else if(!this.commandOptions.defaultCommandOptions.invalidUsageMessage) {
            this.commandOptions.defaultCommandOptions.invalidUsageMessage = "Invalid usage.";
        }
    }

    /**
     * Checks the command client for a command based on the provided message
     * @arg {Message} msg The message object from the message create event
     */
    async onMessageCreate(msg) {
        if(!this.ready) {
            return;
        }
        if(!msg.author) {
            this.emit("warn", `Message ${msg.id} has author=${msg.author} | Channel ${msg.channel.id}, timestamp ${Date.now()}`);
            return;
        }

        msg.command = false;
        if((!this.commandOptions.ignoreSelf || msg.author.id !== this.user.id) && (!this.commandOptions.ignoreBots || !msg.author.bot) && (msg.prefix = this.checkPrefix(msg))) {
            const args = msg.content.replace(/<@!/g, "<@").substring(msg.prefix.length).split(" ");
            const label = args.shift();
            const command = this.resolveCommand(label);
            if(command !== undefined) {
                msg.command = command;
                try {
                    let resp = await msg.command.process(args, msg);
                    if(resp != null) {
                        if(!(resp instanceof Message)) {
                            resp = await this.createMessage(msg.channel.id, resp);
                        }
                        if (msg.command.reactionButtons) {
                            msg.command.reactionButtons.forEach((button) => resp.addReaction(button.emoji));
                            this.activeMessages[resp.id] = {
                                args: args,
                                command: msg.command,
                                timeout: setTimeout(() => {
                                    this.unwatchMessage(resp.id, resp.channel.id);
                                }, msg.command.reactionButtonTimeout)
                            };
                        }
                    }
                    if(msg.command.hooks.postCommand) {
                        msg.command.hooks.postCommand(msg, args, resp);
                    }
                } catch(err) {
                    this.emit("error", err);
                    if(msg.command.hooks.postExecution) {
                        msg.command.hooks.postExecution(msg, args, false);
                    }
                    let newMsg;
                    if(msg.command.errorMessage) {
                        if(typeof msg.command.errorMessage === "function") {
                            const reply = msg.command.errorMessage();
                            if(reply !== undefined) {
                                newMsg = await this.createMessage(msg.channel.id, reply);
                            }
                        } else {
                            newMsg = await this.createMessage(msg.channel.id, msg.command.errorMessage);
                        }
                    }
                    if(msg.command.hooks.postCommand) {
                        msg.command.hooks.postCommand(msg, args, newMsg);
                    }
                }
            }
        }
    }

    resolveCommand(label) {
        label = this.commandAliases[label] || label;
        let command = this.commands[label];
        if(command) {
            return command;
        }
        label = label.toLowerCase();
        label = this.commandAliases[label] || label;
        command = this.commands[label];
        if(command && command.caseInsensitive) {
            return command;
        }
    }

    async onMessageReactionEvent(msg, emoji, userID) {
        if(!this.ready || userID === this.user.id || !(msg.content || msg.embeds || msg.attachments)) {
            return;
        }

        emoji = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;

        const activeMessage = this.activeMessages[msg.id];
        if(activeMessage && activeMessage.command.reactionButtons) {
            const action = activeMessage.command.reactionButtons.find((button) => button.emoji === emoji);
            if(!action) {
                return;
            }

            switch(action.type) {
                case "cancel": {
                    this.unwatchMessage(msg.id, msg.channel.guild && msg.channel.id);
                    try {
                        const resp = await action.execute(msg, activeMessage.args, userID);
                        if(resp != null) {
                            await this.editMessage(msg.channel.id, msg.id, resp);
                        }
                    } catch(err) {} // eslint-disable-line no-empty
                    break;
                }
                case "edit":
                default: {
                    try {
                        const resp = await action.execute(msg, activeMessage.args, userID);
                        if(resp != null) {
                            await this.editMessage(msg.channel.id, msg.id, resp);
                        }
                    } catch(err) {} // eslint-disable-line no-empty
                    break;
                }
            }
        }
    }

    /**
    * Register a prefix override for a specific guild
    * @arg {String} guildID The ID of the guild to override prefixes for
    * @arg {String|Array} prefix The bot prefix. Can be either an array of prefixes or a single prefix. "@mention" will be automatically replaced with the bot's actual mention
    */
    registerGuildPrefix(guildID, prefix) {
        if(!this.preReady){
            this.guildPrefixes[guildID] = prefix;
        } else {
            if(Array.isArray(prefix)){
                for(const i in prefix){
                    prefix[i] = prefix[i].replace(/@mention/g, this.user.mention);
                }
                this.guildPrefixes[guildID] = prefix;
            } else {
                this.guildPrefixes[guildID] = prefix.replace(/@mention/g, this.user.mention);
            }
        }
    }

    checkPrefix(msg) {
        let prefixes = this.commandOptions.prefix;
        if(msg.channel.guild !== undefined && this.guildPrefixes[msg.channel.guild.id] !== undefined){
            prefixes = this.guildPrefixes[msg.channel.guild.id];
        }
        if(typeof prefixes === "string") {
            return msg.content.replace(/<@!/g, "<@").startsWith(prefixes) && prefixes;
        } else if(Array.isArray(prefixes)) {
            return prefixes.find((prefix) => msg.content.replace(/<@!/g, "<@").startsWith(prefix));
        }
        throw new Error("Unsupported prefix format | " + prefixes);
    }

    /**
    * Register an alias for a command
    * @arg {String} alias The alias
    * @arg {String} label The original command label
    */
    registerCommandAlias(alias, label) {
        let caseInsensitiveLabel = false;
        if(!this.commands[label] && !(this.commands[(label = label.toLowerCase())] && (caseInsensitiveLabel = this.commands[label.toLowerCase()].caseInsensitive))) {
            throw new Error("No command registered for " + label);
        }
        alias = caseInsensitiveLabel === true ? alias.toLowerCase() : alias;
        if(this.commandAliases[alias]) {
            throw new Error(`Alias ${alias} already registered`);
        }
        this.commandAliases[alias] = label;
        this.commands[label].aliases.push(alias);
    }

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
    * @arg {Array<{emoji: String, type: String, response: Function | String | Array<Function | String>}>} [options.reactionButtons] An array of objects specifying reaction buttons
    * `emoji` specifies the button emoji. Custom emojis should be in format `emojiName:emojiID`
    * `type` specifies the type of the reaction button, either "edit" or "cancel"
    * `response` specifies the content to edit the message to when the reaction button is pressed. This accepts the same arguments as the `generator` parameter of this function, but with an extra userID parameter for generator functions (`function(msg, args, userID)`) describing the user that made the reaction
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
    registerCommand(label, generator, options = {}) {
        if(label.includes(" ")) {
            throw new Error("Command label may not have spaces");
        }
        let lowercaseCommand = label.toLowerCase();
        if(this.commands[label] || (this.commands[lowercaseCommand] && this.commands[lowercaseCommand].caseInsensitive)) {
            throw new Error("You have already registered a command for " + label);
        }
        // Aliases are not deleted when deleting commands
        let command = this.commandAliases[label]; // Just to make the following if statement less messy
        lowercaseCommand = this.commandAliases[label.toLowerCase()];
        if(this.commands[command] || (this.commands[lowercaseCommand] && this.commands[lowercaseCommand].caseInsensitive)) {
            throw new Error(`Alias ${label} already registered`);
        }
        options.defaultSubcommandOptions = options.defaultSubcommandOptions || {};
        for(const key in this.commandOptions.defaultCommandOptions) {
            if(this.commandOptions.defaultCommandOptions.hasOwnProperty(key) && options[key] === undefined) {
                options[key] = this.commandOptions.defaultCommandOptions[key];
                options.defaultSubcommandOptions[key] = this.commandOptions.defaultCommandOptions[key];
            }
        }
        label = options.caseInsensitive === true ? label.toLowerCase() : label;
        if(this.commands[label]) {
            throw new Error("You have already registered a command for " + label);
        }
        command = this.commandAliases[label];
        if(this.commands[command]) {
            throw new Error(`Alias ${command} already registered`);
        }
        if(options.aliases) {
            options.aliases.forEach((alias) => {
                lowercaseCommand = alias.toLowerCase();
                if(this.commands[alias] || (this.commands[lowercaseCommand] && this.commands[lowercaseCommand].caseInsensitive)) {
                    throw new Error("You have already registered a command for alias " + alias);
                }
                command = this.commandAliases[alias];
                lowercaseCommand = this.commandAliases[alias.toLowerCase()];
                if(this.commands[command] || (this.commands[lowercaseCommand] && this.commands[lowercaseCommand].caseInsensitive)) {
                    throw new Error(`Alias ${alias} already registered`);
                }
                alias = options.caseInsensitive === true ? alias.toLowerCase() : alias;
                if(this.commands[alias]) {
                    throw new Error("You have already registered a command for alias " + alias);
                }
                command = this.commandAliases[alias];
                if(this.commands[command]) {
                    throw new Error(`Alias ${alias} already registered`);
                }
                this.commandAliases[alias] = label;
            });
        }
        this.commands[label] = new Command(label, generator, options);
        return this.commands[label];
    }

    /**
    * Unregister a command
    * @arg {String} label The command label
    */
    unregisterCommand(label) {
        const original = this.commandAliases[label];
        if(original) {
            this.commands[original].aliases.splice(this.commands[original].aliases.indexOf(label), 1);
            delete this.commandAliases[label];
        } else {
            delete this.commands[label];
        }
    }

    unwatchMessage(id, channelID) {
        delete this.activeMessages[id];
        if(channelID) {
            this.removeMessageReactions(channelID, id).catch(function(){});
        }
    }
}

module.exports = CommandClient;
