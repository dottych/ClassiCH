const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const config = require('../Config');

class CommandAbout extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "about";
        this.description = "Says stuff about the server.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, config.self.server.name);
    }
}

module.exports = CommandAbout;