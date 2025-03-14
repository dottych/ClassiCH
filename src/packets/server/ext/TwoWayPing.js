const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class TwoWayPingPacket extends ServerPacket {
    constructor(clients, direction, data) {
        super(clients, lists.serverPackets.ext.twoWayPing);

        this.direction = direction;
        this.data = data;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.direction,
            ...utils.uInt16(this.data)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = TwoWayPingPacket;