const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');

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
            new ServerMessagePacket(utils.getAllPlayerClients(), 0x00, message);
        
    }
}

module.exports = CommandBroadcast;