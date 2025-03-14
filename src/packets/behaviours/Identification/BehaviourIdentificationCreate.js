const Behaviour = require('../../Behaviour');

const Player = require('../../../Player');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class BehaviourIdentificationCreate extends Behaviour {
    constructor(client, playerName, cpe) {
        super();

        this.client = client;

        this.name = playerName;

        this.cpe = cpe;

        this.successful = this.execute();
    }

    execute() {
        // give client its identity
        this.client.id = utils.findFirstUnusedID(lists.players);
        
        const isOp = lists.ops.indexOf(this.name) >= 0;

        // create player object in list
        lists.players[this.client.id] = new Player(

            this.client,
            this.client.id,
            this.name,
            isOp,
            this.cpe

        );

        lists.players[this.client.id].lastActivity = Math.round(performance.now());

        return true;
    }
}

module.exports = BehaviourIdentificationCreate;