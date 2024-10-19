const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const world = require('../World');

class CommandBackup extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "backup";
        this.description = "Saves a backup of the current world.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, "&eSaving backup...");

        if (world.backup())
            new ServerMessagePacket([this.client], 0x00, "&eBackup saved.");
        else
            new ServerMessagePacket([this.client], 0x00, "&eSomething went wrong.");
    }
}

module.exports = CommandBackup;