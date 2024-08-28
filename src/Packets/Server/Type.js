const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class TypePacket extends ServerPacket {
    constructor(clients, type) {
        super(clients, lists.serverPackets.type);

        this.playerType = type;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(this.type, this.playerType);

        super.buffer = Buffer.from(data);
    }
}

module.exports = TypePacket;