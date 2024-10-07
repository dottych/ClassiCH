const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');

class CustomBlockSupportLevelPacket extends ServerPacket {
    constructor(clients) {
        super(clients, lists.serverPackets.ext.customBlockSupportLevel);

        this.supportLevel = 1;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.supportLevel

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = CustomBlockSupportLevelPacket;