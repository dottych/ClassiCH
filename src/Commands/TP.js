const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');
const ServerMovementPacket = require('../Packets/Server/Movement');

const utils = require('../Utils');

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
            new ServerMessagePacket([this.client], 0xFF, "You must provide a name!");
            return;
        }

        if (this.args.length >= 2) {
            let player1 = utils.findPlayerByName(this.args[0]);
            let player2 = utils.findPlayerByName(this.args[1]);

            if (player1 != undefined && player2 != undefined) {
                new ServerMovementPacket(
                    
                    [player1.client],
                    true,
                    0xFF,
                    player2.x,
                    utils.uInt16(utils.parseUInt16(player2.y) - 21),
                    player2.z,
                    player2.yaw,
                    player2.pitch
                    
                );
                new ServerMessagePacket([this.client], 0xFF, `Teleported ${this.args[0]} to ${this.args[1]}.`);

                return;
            }

            new ServerMessagePacket([this.client], 0xFF, "One of the players is not online!");
        } else {
            let player = utils.findPlayerByName(this.args[0]);

            if (player != undefined) {
                new ServerMovementPacket(
                    
                    [this.client],
                    true,
                    0xFF,
                    player.x,
                    utils.uInt16(utils.parseUInt16(player.y) - 21),
                    player.z,
                    player.yaw,
                    player.pitch
                    
                );
                new ServerMessagePacket([this.client], 0xFF, `Teleported to ${this.args[0]}.`);

                return;
            }  

            new ServerMessagePacket([this.client], 0xFF, "Player is not online!");
        }
    }
}

module.exports = CommandTP;