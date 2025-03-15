const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');
const ServerTeleportPacket = require('../packets/server/Teleport');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandTP extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "tp";
        this.description = "Teleports you to a specified player, or player to player.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (this.args.length >= 2) {
            let player1 = utils.findPlayerByName(this.args[0], lists.players);
            let player2 = utils.findPlayerByName(this.args[1], lists.players);

            if (player1 != undefined && player2 != undefined) {
                new ServerTeleportPacket(
                    
                    [player1.client],
                    true,
                    0x00,
                    player2.x,
                    utils.uInt16(utils.parseUInt16(player2.y) - 21),
                    player2.z,
                    player2.yaw,
                    player2.pitch
                    
                );
                new ServerMessagePacket([this.client], 0x00, `&eTeleported ${this.args[0]} to ${this.args[1]}.`);

                return;
            }

            new ServerMessagePacket([this.client], 0x00, "&eOne of the players is not online!");
        } else {
            let player = utils.findPlayerByName(this.args[0], lists.players);

            if (player != undefined) {
                new ServerTeleportPacket(
                    
                    [this.client],
                    true,
                    0x00,
                    player.x,
                    utils.uInt16(utils.parseUInt16(player.y) - 21),
                    player.z,
                    player.yaw,
                    player.pitch
                    
                );
                new ServerMessagePacket([this.client], 0x00, `&eTeleported to ${this.args[0]}.`);

                return;
            }  

            new ServerMessagePacket([this.client], 0x00, "&ePlayer is not online!");
        }
    }
}

module.exports = CommandTP;