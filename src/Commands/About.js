const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const config = require('../Config');

class CommandAbout extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "about";
        this.description = "Says stuff about the server.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0xFF, config.self.server.name);
    }
}

module.exports = CommandAbout;