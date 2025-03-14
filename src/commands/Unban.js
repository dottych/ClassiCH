const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');

class CommandUnban extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "unban";
        this.description = "Unbans a specified player.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (lists.removeBan(this.args[0]))
            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} is now unbanned.`);
        else
            new ServerMessagePacket([this.client], 0x00, `&e${this.args[0]} isn't banned!`);

    }
}

module.exports = CommandUnban;