const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

class CommandPing extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "ping";
        this.description = "A game of Pong!";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0xFF, "Pong!");
    }
}

module.exports = CommandPing;