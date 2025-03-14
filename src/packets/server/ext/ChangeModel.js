const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class ChangeModelPacket extends ServerPacket {
    constructor(clients, entityID, model) {
        super(clients, lists.serverPackets.ext.changeModel);

        this.entityID = entityID;
        this.model = model;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.entityID,
            ...utils.string(this.model)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = ChangeModelPacket;