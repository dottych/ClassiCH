const ClientPacket = require('../ClientPacket');

const ServerMessagePacket = require('../Server/Message');
const ServerDisconnectPacket = require('../Server/Disconnect');

const Command = require('../../Command');

const lists = require('../../Lists');
const utils = require('../../Utils');
const config = require('../../Config');
const commands = require('../../Commands');

class MessagePacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.message);

        this.message;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.message = utils.readString(this.buffer, 2).trim();
    }

    handle() {
        const player = lists.players[this.client.id];

        // if player is spamming
        if (!player.op && player.msgCount >= config.self.messages.spamCount) {
            new ServerDisconnectPacket([this.client], "Too many messages!");
            return;
        }

        // if message has invalid characters
        for (let char of this.message)
            if (lists.chatCharacters.indexOf(char) < 0) {
                new ServerDisconnectPacket([this.client], "Invalid characters!");
                return;
            }

        player.lastActivity = Math.round(performance.now());
        player.msgCount++;

        if (this.message.indexOf('/') !== 0) {
            // basically no colours for you (for now)
            if (this.message.indexOf('&') > 0) return;

            // split message into 64 characters and send them to all clients
            let actualMessage = utils.splitString(`<${player.name}> ${this.message}`);

            for (let string of actualMessage) {
                // if message still has characters
                if (string.trim() !== "") new ServerMessagePacket(utils.getAllPlayerClients(), this.client.id, string);
            }

            utils.log(actualMessage.join(''));
        } else {
            utils.log(`${player.name} issued command: ${this.message}`);

            let args = this.message.split(' ');
            const command = args.shift().replace('/', '');

            try {
                if (commands[command] != undefined) {
                    if (lists.commands[command].op && !player.op) {
                        new ServerMessagePacket([this.client], 0xFF, "You're not OP!");
                        return;
                    }
                    
                    new (commands[command])(this.client, args).execute();
                } else
                    // unknown command
                    new Command(this.client, args).execute();

            } catch(error) {
                console.log(error);
                utils.log("An unexpected error happened!");
                new ServerMessagePacket([this.client], 0xFF, "An unexpected error happened!");
            }
        }
    }
}

module.exports = MessagePacket;