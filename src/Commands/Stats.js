const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandStats extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "stats";
        this.description = "Says the server's stats.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0xFF, `Players online: ${Object.entries(lists.players).length}`);
        new ServerMessagePacket([this.client], 0xFF, `Uptime: ${Math.floor(performance.now() / 1000)}s`);
        new ServerMessagePacket([this.client], 0xFF, `Memory used: ${Math.round(process.memoryUsage().heapUsed / 1000000)} MB`);
    }
}

module.exports = CommandStats;