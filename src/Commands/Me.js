const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandMe extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "me";
        this.description = "* Player needs help!";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];

        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0xFF, "You must provide a message!");
            return;
        }

        const messages = utils.splitString(`* ${me.name} ${this.args.join(' ')}`);

        for (let message of messages)
            new ServerMessagePacket(utils.getAllPlayerClients(), 0xFF, message);

    }
}

module.exports = CommandMe;