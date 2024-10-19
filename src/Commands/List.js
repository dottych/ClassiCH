const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandList extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "list";
        this.description = "Lists every player on the server.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        let players = [];

        for (let player of Object.values(lists.players))
            players.push(
        
                player.name +
                (player.op ? " (OP)" : "") +
                (player.lastActivity + 120000 < performance.now() ? " (AFK)" : "") +
                (player.name === this.client.name ? " (YOU)" : "")
                
            );
        
        let playerStrings = utils.splitString(players.join(", "), "&a");

        for (let playerString of playerStrings)
            new ServerMessagePacket([this.client], 0x00, playerString);
        
    }
}

module.exports = CommandList;