const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const utils = require('../Utils');
const lists = require('../Lists');
const world = require('../World');

class CommandSetBlock extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "setblock";
        this.description = "Set specified block at coordinate (x,y,z,type) or under you.";

        this.aliases = ["sb"];

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length < 1) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide location+block type, or only block type!");
            return;
        }

        const me = lists.players.get(this.client.id);

        // under
        if (this.args.length === 1) {
            const type = +this.args[0];

            if (isNaN(type) || type < 0 || type > lists.blockLimit) {
                new ServerMessagePacket([this.client], 0x00, "&eInvalid block type!");
                return;
            }

            world.setBlock(
                
                type,
                true,
                Math.round(utils.parseUInt16(me.x)/32),
                Math.round(utils.parseUInt16(me.y)/32)-3,
                Math.round(utils.parseUInt16(me.z)/32)
                
            );

            new ServerMessagePacket([this.client], 0x00, `&eSet block type ${type} under you.`);
        }

        // specifications
        if (this.args.length > 1)
            if (this.args.length !== 4) 
                if (this.args.length === 3) {
                    new ServerMessagePacket([this.client], 0x00, `&eYou must provide a block type!`);
                    return;
                } else {
                    new ServerMessagePacket([this.client], 0x00, `&eYou must provide a location and block type!`);
                    return;
                }

            else {
                const x = +this.args[0];
                const y = +this.args[1];
                const z = +this.args[2];
                const type = +this.args[3];

                if (
                    (x < 0 || x >= world.x) ||
                    (y < 0 || y >= world.y) ||
                    (z < 0 || z >= world.z)
                ) {
                    new ServerMessagePacket([this.client], 0x00, "&eInvalid location!");
                    return;
                }

                if (isNaN(type) || type < 0 || type > lists.blockLimit) {
                    new ServerMessagePacket([this.client], 0x00, "&eInvalid block type!");
                    return;
                }

                world.setBlock(type, true, x, y, z);
                new ServerMessagePacket([this.client], 0x00, `&eSet block type ${type} at ${x} ${y} ${z}.`);
            }

    }
}

module.exports = CommandSetBlock;