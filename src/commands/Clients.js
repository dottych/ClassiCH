const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandClients extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "clients";
        this.description = "Lists clients that players use on the server.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        let clients = {};

        for (let player of lists.players.values()) {
            if (clients[player.client.appName] == undefined)
                clients[player.client.appName] = [];

            clients[player.client.appName].push(player.name);
        }

        for (let client of Object.keys(clients)) {
            let clientStrings = utils.splitString(`${client}: ${clients[client].join(", ")}`, "&a");

            for (let clientString of clientStrings)
                new ServerMessagePacket([this.client], 0x00, clientString);

        }
    }
}

module.exports = CommandClients;