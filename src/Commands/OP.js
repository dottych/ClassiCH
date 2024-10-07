const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');
const ServerTypePacket = require('../Packets/Server/Type');

const lists = require('../Lists');
const utils = require('../Utils');

class CommandOP extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "op";
        this.description = "OPs a specified player.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (lists.addOp(this.args[0])) {
            let player = utils.findPlayerByName(this.args[0]);

            if (player != undefined) {
                player.op = true;
                new ServerTypePacket([player.client], 0x64);
                new ServerMessagePacket([player.client], 0x00, "&eYou're now OP!");
            }  

            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is now OP.`);
        } else
            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is already OP!`);

    }
}

module.exports = CommandOP;