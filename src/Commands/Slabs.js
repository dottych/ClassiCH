const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');
const config = require('../Config');

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
        
        if (config.self.world.features.slabs.forced) {
            new ServerMessagePacket(
                
                [this.client],
                0x00,
                `&eSlabs are forced ${config.self.world.features.slabs.default ? "on" : "off"}.`
                
            );
        } else {
            me.commandVars.slabs = !me.commandVars.slabs;
            new ServerMessagePacket(

                [this.client],
                0x00,
                `&eTurned slabs ${me.commandVars.slabs ? "on" : "off"}.`
                
            );
        }
    }
}

module.exports = CommandSlabs;