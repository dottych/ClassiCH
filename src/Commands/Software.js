const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const config = require('../Config');

class CommandSoftware extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "software";
        this.description = "Says stuff about the server software.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        new ServerMessagePacket([this.client], 0x00, config.software);
        new ServerMessagePacket([this.client], 0x00, "&e----------------");
        new ServerMessagePacket([this.client], 0x00, config.softwareUrl);
        new ServerMessagePacket([this.client], 0x00, "&eThank you for using ClassiCH!");
    }
}

module.exports = CommandSoftware;