const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

class CommandPing extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "ping";
        this.description = "A game of Pong!";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, "&ePong!");
    }
}

module.exports = CommandPing;