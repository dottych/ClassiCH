const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class PingPacket extends ServerPacket {
    constructor(clients) {
        super(clients, lists.serverPackets.ping);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(this.type);

        super.buffer = Buffer.from(data);
    }
}

module.exports = PingPacket;