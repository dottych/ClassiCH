const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');

class CommandBroadcast extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "title";
        this.description = "Shows everyone a specified title message.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a message!");
            return;
        }

        new ServerMessagePacket(utils.getAllPlayerClients(), 100, "&e" + this.args.join(' '));
    }
}

module.exports = CommandBroadcast;