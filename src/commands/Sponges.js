const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');
const config = require('../Config');

class CommandSponges extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "sponges";
        this.description = "Toggles sponges while building.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players.get(this.client.id);
        
        if (config.self.world.features.sponges.forced) {
            new ServerMessagePacket(
                
                [this.client],
                0x00,
                `&eSponges are forced ${config.self.world.features.sponges.default ? "on" : "off"}.`
                
            );
        } else {
            me.commandVars.sponges = !me.commandVars.sponges;
            new ServerMessagePacket(

                [this.client],
                0x00,
                `&eTurned sponges ${me.commandVars.sponges ? "on" : "off"}.`
                
            );
        }
    }
}

module.exports = CommandSponges;