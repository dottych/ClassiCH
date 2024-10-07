const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');

class CommandExplosions extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "explosions";
        this.description = "Toggles explosions while building.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        me.commandVars.explosions = !me.commandVars.explosions;

        new ServerMessagePacket([this.client], 0x00, "&eToggled explosions.");
    }
}

module.exports = CommandExplosions;