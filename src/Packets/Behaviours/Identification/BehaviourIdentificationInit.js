const Behaviour = require('../../Behaviour');

const ServerIdentificationPacket = require('../../Server/Identification');
const ServerPingPacket = require('../../Server/Ping');

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
            utils.populate(config.self.server.motdTitle, {playerName: this.name}),
            utils.populate(
                
                isOp ? config.self.server.motdDescriptionOP : config.self.server.motdDescription,
                {playerName: this.name}

            ),
            isOp

        );

        // initial ping to client
        new ServerPingPacket([this.client]);
        
        return true;
    }
}

module.exports = BehaviourIdentificationInit;