const ClientPacket = require('../ClientPacket');

const ServerMessagePacket = require('../Server/Message');
const ServerDisconnectPacket = require('../Server/Disconnect');

const Command = require('../../Command');

const lists = require('../../Lists');
const utils = require('../../Utils');
const config = require('../../Config');
const commandList = require('../../CommandList');

class MessagePacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.message);

        this.message;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.type = this.buffer[1];
        this.message = utils.readString(this.buffer, 2);
    }

    handle() {
        const player = lists.players[this.client.id];

        player.message += (this.type === 0 ? (player.message.length > 0 ? this.message.trimEnd() : this.message.trim()) : this.message);

        if (this.type === 1) {
            player.longMsgCount++;

            if (player.longMsgCount > 2)
                new ServerDisconnectPacket([this.client], "Invalid long message!");

            return;
        }

        // if player is spamming
        if (!player.op && player.msgCount >= config.self.messages.spamCount) {
            new ServerDisconnectPacket([this.client], "Too many messages!");
            return;
        }

        // if message has invalid characters
        for (let char of player.message)
            if (lists.chatCharacters.indexOf(char) < 0) {
                new ServerDisconnectPacket([this.client], "Invalid characters!");
                return;
            }

        player.lastActivity = Math.round(performance.now());
        player.msgCount++;

        if (player.message.indexOf('/') !== 0) {
            // basically no colours for you (for now)
            if (player.message.indexOf('&') > 0) return;

            // split message into 64 characters and send them to all clients
            let actualMessage = utils.splitString(`${config.self.messages.prefix.replaceAll("%playername%", player.name)}${player.message}`);

            for (let string of actualMessage) {
                // if message still has characters
                if (string.trim() !== "") new ServerMessagePacket(utils.getAllPlayerClients(), 0x00, string);
            }

            utils.log(actualMessage.join(''));
        } else {
            utils.log(`${player.name} issued command: ${player.message}`);

            let args = player.message.trim().split(' ');
            const command = args.shift().replace('/', '');

            try {
                if (commandList[command] != undefined) {
                    if (lists.commands[command].op && !player.op) {
                        new ServerMessagePacket([this.client], 0x00, "You're not OP!");
                        return;
                    }
                    
                    new (commandList[command])(this.client, args).execute();
                } else
                    // unknown command
                    new Command(this.client, args).execute();

            } catch(error) {
                console.log(error);
                utils.log("An unexpected error happened!");
                new ServerMessagePacket([this.client], 0x00, "An unexpected error happened!");
            }
        }

        player.message = "";
        player.longMsgCount = 0;
    }
}

module.exports = MessagePacket;