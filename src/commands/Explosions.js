const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');
const config = require('../Config');

class CommandExplosions extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "explosions";
        this.description = "Toggles explosions while building.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];

        if (config.self.world.features.explosions.forced) {
            new ServerMessagePacket(
                
                [this.client],
                0x00,
                `&eExplosions are forced ${config.self.world.features.explosions.default ? "on" : "off"}.`
                
            );
        } else {
            me.commandVars.explosions = !me.commandVars.explosions;
            new ServerMessagePacket(

                [this.client],
                0x00,
                `&eTurned explosions ${me.commandVars.explosions ? "on" : "off"}.`
                
            );
        }
    }
}

module.exports = CommandExplosions;