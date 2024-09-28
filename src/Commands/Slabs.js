const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandSlabs extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "slabs";
        this.description = "Toggles slabs while building.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        me.commandVars.slabs = !me.commandVars.slabs;

        new ServerMessagePacket([this.client], 0xFF, "Toggled slabs.");
    }
}

module.exports = CommandSlabs;