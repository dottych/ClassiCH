const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');
const ServerTypePacket = require('../packets/server/Type');
const ServerIdentificationPacket = require('../packets/server/Identification');

const lists = require('../Lists');
const utils = require('../Utils');
const config = require('../Config');

class CommandOP extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "op";
        this.description = "OPs a specified player.";

        this.aliases = [];

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (lists.addOp(this.args[0])) {
            let player = utils.findPlayerByName(this.args[0], lists.players);

            if (player != undefined) {
                player.op = true;
                new ServerIdentificationPacket(

                    [player.client],
                    config.pvn,
                    utils.populate(
                        
                        config.self.server.motd.title,
                        {
                            playerName: this.name,
                            playerCount: utils.getPlayerCount(lists.players),
                            greetings: lists.greetings
                        }
                        
                    ),
                    utils.populate(
                        
                        config.self.server.motd.descriptionOP,
                        {
                            playerName: this.name,
                            playerCount: utils.getPlayerCount(lists.players),
                            greetings: lists.greetings
                        }
        
                    ),
                    true
        
                );
                new ServerTypePacket([player.client], 0x64);
                new ServerMessagePacket([player.client], 0x00, "&eYou're now OP!");
            }  

            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is now OP.`);
        } else
            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is already OP!`);

    }
}

module.exports = CommandOP;