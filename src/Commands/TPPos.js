const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');
const ServerTeleportPacket = require('../Packets/Server/Teleport');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandTPPos extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "tppos";
        this.description = "Teleports you to a specified location/orientation.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length < 3) {
            new ServerMessagePacket([this.client], 0xFF, "You must provide a position!");
            return;
        }

        let me = lists.players[this.client.id];

        if (this.args.length === 3) {
            let x = Math.round(+this.args[0]);
            let y = Math.round(+this.args[1]);
            let z = Math.round(+this.args[2]);

            if (isNaN(x) || isNaN(y) || isNaN(z)) {
                new ServerMessagePacket([this.client], 0xFF, `Invalid values!`);
                return;
            }

            new ServerTeleportPacket(
            
                [this.client],
                true,
                0xFF,
                utils.uInt16(x * 32 + 16),
                utils.uInt16((y + 1) * 32),
                utils.uInt16(z * 32 + 16),
                me.yaw,
                me.pitch

            );
            new ServerMessagePacket([this.client], 0xFF, `Teleported to ${this.args[0]} ${this.args[1]} ${this.args[2]}.`);

            return;

        }

        if (this.args.length < 5) {
            new ServerMessagePacket([this.client], 0xFF, `You must provide an orientation!`);
            return;
        }
        
        let x = Math.round(+this.args[0]);
        let y = Math.round(+this.args[1]);
        let z = Math.round(+this.args[2]);
        let yaw = Math.round(+this.args[3]);
        let pitch = Math.round(+this.args[4]);

        if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(yaw) || isNaN(pitch)) {
            new ServerMessagePacket([this.client], 0xFF, `Invalid values!`);
            return;
        }

        new ServerTeleportPacket(
        
            [this.client],
            true,
            0xFF,
            utils.uInt16(x * 32 + 16),
            utils.uInt16((y + 1) * 32),
            utils.uInt16(z * 32 + 16),
            yaw,
            pitch

        );
        new ServerMessagePacket([this.client], 0xFF, `Teleported to ${this.args[0]} ${this.args[1]} ${this.args[2]} ${this.args[3]} ${this.args[4]}.`);
    }
}

module.exports = CommandTPPos;