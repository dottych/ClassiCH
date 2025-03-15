const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const world = require('../World');

class CommandSave extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "save";
        this.description = "Saves the current world.";

        this.aliases = [];

        this.op = true;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, "&eSaving world...");

        if (world.save())
            new ServerMessagePacket([this.client], 0x00, "&eWorld saved.");
        else
            new ServerMessagePacket([this.client], 0x00, "&eSomething went wrong.");
    }
}

module.exports = CommandSave;