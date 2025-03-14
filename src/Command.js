const ServerMessagePacket = require('./packets/server/Message');

class Command {
    constructor(client, args) {
        this.client = client;
        this.args = args;
    }

    // default response
    execute() {
        new ServerMessagePacket([this.client], 0x00, "&eCommand does not exist!");
    }
}

module.exports = Command;