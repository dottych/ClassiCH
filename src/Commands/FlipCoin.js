const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');
const lists = require('../Lists');
const config = require('../Config')

class CommandFlipCoin extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "flipcoin";
        this.description = "Flip a coin.";

        this.op = false;
        this.hidden = false;
    }

    execute() {
        const me = lists.players[this.client.id];

        if (performance.now() < me.commandVars.flipped + config.self.commands["flipDelay"] * 1000) {
            new ServerMessagePacket([this.client], 0xFF, `You can flip a coin later.`);
            return;
        }

        me.commandVars.flipped = Math.round(performance.now());

        const coin = Math.round(Math.random()) === 0 ? "Heads" : "Tails";

        new ServerMessagePacket(
            
            utils.getAllPlayerClients(),
            0xFF,
            `&b${me.name} flipped a coin and got ${coin}!`
            
        );

        utils.log(`&b${me.name} flipped a coin and got ${coin}!`);

    }
}

module.exports = CommandFlipCoin;