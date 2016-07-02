"use strict";

const Client = require("../Client");
const Command = require("./Command");

/**
* Represents an Eris client with the command framework
* @extends Client
* @prop {Object} commands Objecf mapping command labels to Command objects
*/
class CommandClient extends Client {
    /**
    * Create a CommandClient
    * @arg {String} token bot token
    * @arg {Object} [options] Eris options (same as Client)
    * @arg {Object} [commandOptions] Command options
    * @arg {Object} [commandOptions.defaultHelpCommand=true] Whether to register the default help command or not
    * @arg {Object} [commandOptions.description="An Eris-based Discord bot"] The description to show in the default help command
    * @arg {Object} [commandOptions.ignoreBots=true] Whether to ignore bot accounts or not
    * @arg {Object} [commandOptions.name="<Bot username>"] The bot name to show in the default help command
    * @arg {Object} [commandOptions.owner="an unknown user"] The owner to show in the default help command
    * @arg {Object} [commandOptions.prefix="@mention "] The bot prefix. "@mention" will be automatically replaced with the bot's actual mention
    */
    constructor(token, options, commandOptions) {
        super(token, options);
        this.commandOptions = {
            defaultHelpCommand: true,
            description: "An Eris-based Discord bot",
            ignoreBots: true,
            name: null,
            owner: "an unknown user",
            prefix: "@mention " // TODO multi-prefix
        };
        if(typeof commandOptions === "object") {
            for(var property of Object.keys(commandOptions)) {
                this.commandOptions[property] = commandOptions[property];
            }
        }
        this.commands = {};
        this.commandAliases = {};

        this.once("shardPreReady", () => {
            if(!this.commandOptions.name) {
                this.commandOptions.name = `**${this.user.username}**`;
            }
            this.commandOptions.prefix = this.commandOptions.prefix.replace(/@mention/g, `<@${this.user.id}>`);
        });

        this.on("messageCreate", (msg) => {
            if(!this.ready) {
                return;
            }

            if(msg.author.id !== this.user.id && (!this.commandOptions.ignoreBots || !msg.author.bot) && msg.content.startsWith(this.commandOptions.prefix)) {
                var args = msg.content.substring(this.commandOptions.prefix.length).split(" ");
                var label = args.shift();
                label = this.commandAliases[label] || label;
                var command;
                if((command = this.commands[label]) !== undefined) {
                    var resp = (command.process(args, msg) || "").toString();
                    if(resp) {
                        this.createMessage(msg.channel.id, {
                            content: resp
                        });
                    }
                    if(command.deleteCommand) {
                        this.deleteMessage(msg.channel.id, msg.id);
                    }
                }
            }
        });

        if(this.commandOptions.defaultHelpCommand) {
            this.registerCommand("help", (msg, args) => {
                var result = "";
                if(args.length > 0) {
                    var cur = this.commands[this.commandAliases[args[0]] || args[0]];
                    if(!cur) {
                        return "Command not found";
                    }
                    var label = cur.label;
                    for(var i = 1; i < args.length; i++) {
                        cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
                        if(!cur) {
                            return "Command not found";
                        }
                        label += " " + cur.label;
                    }
                    result += `**${this.commandOptions.prefix}${label}** ${cur.usage}\n${cur.fullDescription}`;
                    if(Object.keys(cur.aliases).length > 0) {
                        result += `\n\n**Aliases:** ${cur.aliases.join(", ")}`;
                    }
                    if(Object.keys(cur.subcommands).length > 0) {
                        result += "\n\n**Subcommands:**";
                        for(var subLabel in cur.subcommands) {
                            if(cur.subcommands[subLabel].permissionCheck(args, msg)) {
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
                    for(label in this.commands) {
                        if(this.commands[label].permissionCheck(args, msg)) {
                            result += `  **${this.commandOptions.prefix}${label}** - ${this.commands[label].description}\n`;
                        }
                    }
                    result += `\nType ${this.commandOptions.prefix}help <command> for more info on a command.`;
                    if(this.commandOptions.suffix) {
                        result += `\n\n${this.commandOptions.suffix}\n`;
                    }
                }
                return result;
            }, {
                description: "This help text",
                fullDescription: "This command is used to view information of different bot commands, including this one."
            });
        }
    }

    /**
    * Register an alias for a command
    * @arg {String} alias The alias
    * @arg {String} label The original command label
    */
    registerCommandAlias(alias, label) {
        if(!this.commands[label]) {
            throw new Error("No command registered for " + label);
        }
        if(this.commandAliases[alias]) {
            throw new Error(`Alias ${label} already registered`);
        }
        this.commandAliases[alias] = label;
        this.commands[label].aliases.push(alias);
    }

    /**
    * Register a command
    * @arg {String} label The command label
    * @arg {Function|String|falsy} generator A response string, falsy value (false, null, undefined, etc.), or function that generates a String or falsy value when called.
    * If a function is passed, the function will be passed a Message object and an array of command arguments
    * <pre><code>generator(msg, args)</code></pre>
    * @arg {Object} [options] Command options
    * @arg {Array<String>} [options.aliases] An array of command aliases
    * @arg {String} [options.deleteCommand=false] Whether to delete the user command message or not
    * @arg {String} [options.serverOnly=false] Whether to prevent the command from being used in Direct Messages or not
    * @arg {String} [options.description="No description"] A short description of the command to show in the default help command
    * @arg {String} [options.fullDescription="No full description"] A detailed description of the command to show in the default help command
    * @arg {String} [options.usage] Details on how to call the command to show in the default help command
    * @arg {String} [options.requirements] A set of factors that limit who can call the command
    * @arg {String} [options.requirements.userIDs] A set of user IDs representing users that can call the command
    * @arg {String} [options.requirements.permissions] An array of permission keys the user must have to use the command
    * i.e.:
    * ```
    * {
    *   "administrator": false,
    *   "manageMessages": true
    * }```
    * In the above example, the user must not have administrator permissions, but must have manageMessages to use the command
    * @arg {String} [options.requirements.roleIDs] An array of role IDs that would allow a user to use the command
    * @arg {String} [options.requirements.roleNames] An array of role names that would allow a user to use the command
    * @returns {Command}
    */
    registerCommand(label, generator, options) {
        if(label.includes(" ")) {
            throw new Error("Command label may not have spaces");
        }
        if(this.commands[label]) {
            throw new Error("You have already registered a command for " + label);
        }
        options = options || {};
        this.commands[label] = new Command(label, generator, options);
        if(options.aliases) {
            options.aliases.forEach((alias) => {
                this.commandAliases[alias] = label;
            });
        }
        return this.commands[label];
    }

    /**
    * Unregister a command
    * @arg {String} label The command label
    */
    unregisterCommand(label) {
        var original = this.commandAliases[label];
        if(original) {
            this.commands[original].aliases.splice(this.commands[original].aliases.indexOf(label), 1);
            this.commandAliases[label] = undefined;
        } else {
            this.commands[label] = undefined;
        }
    }
}

module.exports = CommandClient;