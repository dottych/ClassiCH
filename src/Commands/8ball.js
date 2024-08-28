const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');

const utils = require('../Utils');
const lists = require('../Lists');
const config = require('../Config')

class Command8ball extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "8ball";
        this.description = "Ask 8-Ball something.";

        this.op = false;
        this.hidden = false;
    }

    wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    execute() {
        const me = lists.players[this.client.id];

        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0xFF, `You must ask a question.`);
            return;
        }

        if (performance.now() < me.commandVars.asked + config.self.commands["8ballDelay"] * 1000) {
            new ServerMessagePacket([this.client], 0xFF, `Ask later.`);
            return;
        }

        me.commandVars.asked = Math.round(performance.now());

        async function ask(self) {
            let questionMessages = utils.splitString(`${me.name} asked 8-Ball: ${self.args.join(' ')}`, "&7");

            for (let questionMessage of questionMessages)
                new ServerMessagePacket(
                    
                    utils.getAllPlayerClients(),
                    0xFF,
                    questionMessage
                    
                );

            await self.wait(1000 + Math.round(Math.random() * 1000));

            let answerMessages = utils.splitString(

                `8-Ball: ${me.name}, ${lists.answers[Math.floor(Math.random() * lists.answers.length)].toLowerCase().replaceAll(' i ', ' I ')}.`,
                "&7"

            );

            for (let answerMessage of answerMessages)
                new ServerMessagePacket(
                    
                    utils.getAllPlayerClients(),
                    0xFF,
                    answerMessage
                    
                );

            utils.log(answerMessages.join(''));
        }

        ask(this);
    }
}

module.exports = Command8ball;