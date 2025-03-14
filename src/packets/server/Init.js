const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class InitPacket extends ServerPacket {
    constructor(clients) {
        super(clients, lists.serverPackets.init);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(this.type);

        super.buffer = Buffer.from(data);
    }
}

module.exports = InitPacket;