const ClientPacket = require('../../ClientPacket');

const ServerTwoWayPingPacket = require('../../server/ext/TwoWayPing');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class TwoWayPingPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.ext.twoWayPing);

        this.direction;
        this.data;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.direction = this.buffer[1];
        this.data = utils.parseUInt16(utils.readUInt16(this.buffer, 2));
    }

    handle() {
        if (this.direction === 0)
            new ServerTwoWayPingPacket([this.client], this.direction, this.data);

        if (this.direction === 1);
            //lists.players[this.client.id].ping
    }
}

module.exports = TwoWayPingPacket;