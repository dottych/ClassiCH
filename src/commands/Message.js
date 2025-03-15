const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');
const utils = require('../Utils');
const config = require('../Config');

class CommandMessage extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "message";
        this.description = "Private-messages a specified player.";

        this.aliases = ["msg"];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (!config.self.commands.selfActions && this.args[0] === lists.players[this.client.id].name) {
            new ServerMessagePacket([this.client], 0x00, "&eYou can't message yourself!");
            return;
        }

        if (this.args.length <= 1) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a message!");
            return;
        }

        let player = utils.findPlayerByName(this.args.shift(), lists.players);

        if (player == undefined) {
            new ServerMessagePacket([this.client], 0x00, "&ePlayer is not online!");
            return;
        }

        lists.players[this.client.id].commandVars.messaging = player.name;
        player.commandVars.messaging = lists.players[this.client.id].name;

        let messagesMe = utils.splitString(`[YOU > ${player.name}] ${this.args.join(' ')}`, "&7");
        let messagesThem = utils.splitString(`[${lists.players[this.client.id].name} > YOU] ${this.args.join(' ')}`, "&7");

        for (let message of messagesMe)
            new ServerMessagePacket([this.client], 0x00, message);

        for (let message of messagesThem)
            new ServerMessagePacket([player.client], 0x00, message);

    }
}

module.exports = CommandMessage;