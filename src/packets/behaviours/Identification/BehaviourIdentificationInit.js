const Behaviour = require('../../Behaviour');

const ServerIdentificationPacket = require('../../server/Identification');
const ServerPingPacket = require('../../server/Ping');

const lists = require('../../../Lists');
const utils = require('../../../Utils');
const config = require('../../../Config');

class BehaviourIdentificationInit extends Behaviour {
    constructor(client, playerName) {
        super();

        this.client = client;
        
        this.name = playerName;

        this.successful = this.execute();
    }

    execute() {
        const isOp = lists.ops.indexOf(this.name) >= 0;

        // give client initial data
        new ServerIdentificationPacket(

            [this.client],
            config.pvn,
            utils.populate(
                
                config.self.server.motd.title,
                {
                    playerName: this.name,
                    playerCount: utils.getPlayerCount(lists.players),
                    greetings: lists.greetings
                }
                
            ),
            utils.populate(
                
                isOp ? config.self.server.motd.descriptionOP : config.self.server.motd.description,
                {
                    playerName: this.name,
                    playerCount: utils.getPlayerCount(lists.players),
                    greetings: lists.greetings
                }

            ),
            isOp

        );

        // initial ping to client
        new ServerPingPacket([this.client]);
        
        return true;
    }
}

module.exports = BehaviourIdentificationInit;