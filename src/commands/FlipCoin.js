const Command = require('../Command');

const ServerMessagePacket = require('../packets/server/Message');

const utils = require('../Utils');
const lists = require('../Lists');
const config = require('../Config')

class CommandFlipCoin extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "flipcoin";
        this.description = "Flip a coin.";

        this.aliases = [];

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players.get(this.client.id);

        if (performance.now() < me.commandVars.flipped + config.self.commands["flipDelay"] * 1000) {
            new ServerMessagePacket([this.client], 0x00, `&eYou can flip a coin later.`);
            return;
        }

        me.commandVars.flipped = Math.round(performance.now());

        const coin = Math.round(Math.random()) === 0 ? "Heads" : "Tails";

        new ServerMessagePacket(
            
            utils.getAllPlayerClients(lists.players),
            0x00,
            `&b${me.name} flipped a coin and got ${coin}!`
            
        );

        utils.log(`&b${me.name} flipped a coin and got ${coin}!`);

    }
}

module.exports = CommandFlipCoin;