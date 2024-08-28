const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandSapling extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "sapling";
        this.description = "Toggles saplings while building.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        me.commandVars.sapling = !me.commandVars.sapling;

        new ServerMessagePacket([this.client], 0xFF, "Toggled saplings.");
    }
}

module.exports = CommandSapling;