const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');
const config = require('../Config');

class CommandFlowers extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "flowers";
        this.description = "Toggles flowers while building.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];
        
        if (config.self.world.features.flowers.forced) {
            new ServerMessagePacket(
                
                [this.client],
                0x00,
                `&eFlowers are forced ${config.self.world.features.flowers.default ? "on" : "off"}.`
                
            );
        } else {
            me.commandVars.flowers = !me.commandVars.flowers;
            new ServerMessagePacket(

                [this.client],
                0x00,
                `&eTurned flowers ${me.commandVars.flowers ? "on" : "off"}.`
                
            );
        }
    }
}

module.exports = CommandFlowers;