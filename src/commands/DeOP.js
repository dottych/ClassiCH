const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');
const ServerTypePacket = require('../packets/server/Type');
const ServerIdentificationPacket = require('../packets/server/Identification');

const lists = require('../Lists');
const utils = require('../Utils');
const config = require('../Config');

class CommandDeOP extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "deop";
        this.description = "DeOPs a specified player.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (!config.self.commands.selfActions && this.args[0] === lists.players[this.client.id].name) {
            new ServerMessagePacket([this.client], 0x00, "&eYou can't deop yourself!");
            return;
        }

        if (lists.removeOp(this.args[0])) {
            let player = utils.findPlayerByName(this.args[0]);

            if (player != undefined) {
                player.op = false;
                new ServerIdentificationPacket(

                    [player.client],
                    config.pvn,
                    utils.populate(config.self.server.motd.title, {playerName: this.name}),
                    utils.populate(
                        
                        config.self.server.motd.description,
                        {playerName: this.name}
        
                    ),
                    false
        
                );
                new ServerTypePacket([player.client], 0x00);
            }  

            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is no longer OP.`);
        } else
            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} isn't OP!`);

    }
}

module.exports = CommandDeOP;