const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const lists = require('../Lists');
const utils = require('../Utils');

class CommandR extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "r";
        this.description = "Replies to the last messaged player.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        let messaging = lists.players[this.client.id].commandVars.messaging;

        if (messaging == undefined || messaging == "") {
            new ServerMessagePacket([this.client], 0xFF, "There is no one to reply to!");
            return;
        }

        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0xFF, "You must provide a message!");
            return;
        }

        let player = utils.findPlayerByName(messaging);

        if (player == undefined) {
            new ServerMessagePacket([this.client], 0xFF, "Player is not online!");
            return;
        }

        let messagesMe = utils.splitString(`[YOU > ${player.name}] ${this.args.join(' ')}`, "&7");
        let messagesThem = utils.splitString(`[${lists.players[this.client.id].name} > YOU] ${this.args.join(' ')}`, "&7");

        for (let message of messagesMe)
            new ServerMessagePacket([this.client], 0xFF, message);

        for (let message of messagesThem)
            new ServerMessagePacket([player.client], 0xFF, message);

    }
}

module.exports = CommandR;