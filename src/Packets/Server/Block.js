const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class BlockPacket extends ServerPacket {
    constructor(clients, x, y, z, blockType) {
        super(clients, lists.serverPackets.block);

        this.x = x;
        this.y = y;
        this.z = z;
        this.blockType = blockType;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...this.x,
            ...this.y,
            ...this.z,
            this.blockType

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = BlockPacket;