const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

class CommandUptime extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "uptime";
        this.description = "Says the server's uptime.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0xFF, `The server is running for ${Math.floor(performance.now() / 1000)}s.`);
    }
}

module.exports = CommandUptime;