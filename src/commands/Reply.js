const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const lists = require('../Lists');
const utils = require('../Utils');

class CommandReply extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "reply";
        this.description = "Replies to the last messaged player.";

        this.aliases = ["respond", "r"];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players.get(this.client.id);
        let messaging = me.commandVars.messaging;

        if (messaging == undefined || messaging == "") {
            new ServerMessagePacket([this.client], 0x00, "&eThere is no one to reply to!");
            return;
        }

        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a message!");
            return;
        }

        let player = utils.findPlayerByName(messaging, lists.players);

        if (player == undefined) {
            new ServerMessagePacket([this.client], 0x00, "&ePlayer is not online!");
            return;
        }

        let messagesMe = utils.splitString(`[YOU > ${player.name}] ${this.args.join(' ')}`, "&7");
        let messagesThem = utils.splitString(`[${me.name} > YOU] ${this.args.join(' ')}`, "&7");

        for (let message of messagesMe)
            new ServerMessagePacket([this.client], 0x00, message);

        for (let message of messagesThem)
            new ServerMessagePacket([player.client], 0x00, message);

    }
}

module.exports = CommandReply;