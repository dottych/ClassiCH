const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');

class CommandStats extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "stats";
        this.description = "Says the server's stats.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, `&ePlayers online: ${Object.entries(lists.players).length}`);
        new ServerMessagePacket([this.client], 0x00, `&eUptime: ${Math.floor(performance.now() / 1000)}s`);
        new ServerMessagePacket([this.client], 0x00, `&eMemory used: ${Math.round(process.memoryUsage().heapUsed / 1000000)} MB`);
    }
}

module.exports = CommandStats;