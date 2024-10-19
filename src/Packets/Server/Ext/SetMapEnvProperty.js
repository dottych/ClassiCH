const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class SetMapEnvPropertyPacket extends ServerPacket {
    constructor(clients, propertyType, propertyValue) {
        super(clients, lists.serverPackets.ext.setMapEnvProperty);

        this.propertyType = propertyType;
        this.propertyValue = propertyValue;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.propertyType,
            ...utils.uInt32(this.propertyValue)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = SetMapEnvPropertyPacket;