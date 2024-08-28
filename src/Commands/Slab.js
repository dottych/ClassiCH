const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandSlab extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "slab";
        this.description = "Toggles slabs while building.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        me.commandVars.slab = !me.commandVars.slab;

        new ServerMessagePacket([this.client], 0xFF, "Toggled slabs.");
    }
}

module.exports = CommandSlab;