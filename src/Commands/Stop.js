const Command = require('../Command');

const ServerDisconnectPacket = require('../packets/server/Disconnect');

const utils = require('../Utils');

class CommandStop extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "stop";
        this.description = "Stops the server.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        new ServerDisconnectPacket(utils.getAllPlayerClients(), `Server is shutting down...`);
        
        setTimeout(() => {
            process.exit();
        }, 1000);
    }
}

module.exports = CommandStop;