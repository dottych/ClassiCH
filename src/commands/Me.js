const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandMe extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "me";
        this.description = "* Player needs help!";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players.get(this.client.id);

        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a message!");
            return;
        }

        const messages = utils.splitString(`* ${me.name} ${this.args.join(' ')}`, "&e");

        for (let message of messages)
            new ServerMessagePacket(utils.getAllPlayerClients(lists.players), 0x00, message);

    }
}

module.exports = CommandMe;