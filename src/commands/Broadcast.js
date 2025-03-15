const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandBroadcast extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "broadcast";
        this.description = "Broadcasts a message.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a message!");
            return;
        }

        const messages = utils.splitString(`[BROADCAST] ${this.args.join(' ')}`, "&e");

        for (let message of messages)
            new ServerMessagePacket(utils.getAllPlayerClients(lists.players), 0x00, message);
        
    }
}

module.exports = CommandBroadcast;