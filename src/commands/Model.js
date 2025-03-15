const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');
const ServerExtChangeModelPacket = require('../packets/server/ext/ChangeModel');

const utils = require('../Utils');
const lists = require('../Lists');

class CommandModel extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "model";
        this.description = "Sets your model to a specified model. \"reset\" will reset it.";

        this.aliases = ["character", "char"];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0x00, "&eYou must provide a model!");
            return;
        }

        const me = lists.players[this.client.id];
        let reset = false;

        if (this.args[0] === "reset") {
            me.model = "humanoid";

            new ServerMessagePacket([this.client], 0x00, "&eReset your model.");
            reset = true;
        }

        me.model = this.args[0];

        new ServerExtChangeModelPacket([this.client], 0xFF, me.model);
        new ServerExtChangeModelPacket(utils.getOtherPlayerClients(this.client, lists.players), this.client.id, me.model);

        if (!reset) new ServerMessagePacket([this.client], 0x00, `&eSet your model to ${me.model}.`);
    }
}

module.exports = CommandModel;