const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

class CommandMemory extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "memory";
        this.description = "Says the server's memory usage.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0xFF, `Memory used: ${Math.round(process.memoryUsage().heapUsed / 1000000)} MB`);
    }
}

module.exports = CommandMemory;