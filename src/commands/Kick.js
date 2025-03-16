const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');
const ServerDisconnectPacket = require('../packets/server/Disconnect');

const lists = require('../Lists');
const utils = require('../Utils');
const config = require('../Config');

class CommandKick extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "kick";
        this.description = "Kicks a specified player.";

        this.aliases = [];

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a name!");
            return;
        }

        if (!config.self.commands.selfActions && this.args[0] === lists.players.get(this.client.id).name) {
            new ServerMessagePacket([this.client], 0x00, "&eYou can't kick yourself!");
            return;
        }

        let name = this.args.shift();
        let player = utils.findPlayerByName(name, lists.players);
        let reason = this.args.join(' ');

        if (player != undefined) {
            if (reason.trim() !== "")
                new ServerDisconnectPacket([player.client], `Kicked: ${reason}`);
            else
                new ServerDisconnectPacket([player.client], "You were kicked!");
            
            new ServerMessagePacket([this.client], 0x00, `&e${name} was kicked.`);
        } else
            new ServerMessagePacket([this.client], 0x00, `&e${name} isn't online!`);

    }
}

module.exports = CommandKick;