const Behaviour = require('../../Behaviour');

const ServerExtInfoPacket = require('../../Server/Ext/ExtInfo');
const ServerExtEntryPacket = require('../../Server/Ext/ExtEntry');

const lists = require('../../../Lists');

class BehaviourIdentificationCPE extends Behaviour {
    constructor(client) {
        super();

        this.client = client;

        this.successful = this.execute();
    }

    execute() {
        new ServerExtInfoPacket([this.client]);

        for (let extension of Object.entries(lists.supportedExtensions))
            new ServerExtEntryPacket([this.client], extension[0], extension[1]);

        return true;
    }
}

module.exports = BehaviourIdentificationCPE;