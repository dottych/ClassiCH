const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandHelp extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "help";
        this.description = "Says all commands or the description of a command.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        if (this.args.length > 0) {
            new ServerMessagePacket(
                
                [this.client],
                0x00,
                lists.commands[this.args[0]] != undefined
                ? `&a${lists.commands[this.args[0]].description}` : "&aCommand does not exist, no help here!"
                
            );
        } else {
            let commands = [];

            for (let command of Object.keys(lists.commands)) {
                if (lists.commands[command].hidden) continue;
                if (lists.commands[command].op && !lists.players[this.client.id].op) continue;
                
                commands.push(command);
            }

            let commandStrings = utils.splitString(`Commands: ${commands.join(', ')}`, "&a");
            let commandInfoStrings = utils.splitString("Use /help (command) to view information about a command.", "&b");

            for (let commandString of commandStrings)
                new ServerMessagePacket([this.client], 0x00, commandString);

            for (let commandInfoString of commandInfoStrings)
                new ServerMessagePacket([this.client], 0x00, commandInfoString);
        }
    }
}

module.exports = CommandHelp;