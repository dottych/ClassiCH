const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandSaplings extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "saplings";
        this.description = "Toggles saplings while building.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        me.commandVars.saplings = !me.commandVars.saplings;

        new ServerMessagePacket([this.client], 0xFF, "Toggled saplings.");
    }
}

module.exports = CommandSaplings;