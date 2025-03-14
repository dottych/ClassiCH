const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class PositionPacket extends ServerPacket {
    constructor(clients, isClient, id, xChange, yChange, zChange) {
        super(clients, lists.serverPackets.position);

        this.isClient = isClient;

        this.id = id;
        this.xChange = xChange;
        this.yChange = yChange;
        this.zChange = zChange;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.isClient ? 0xFF : this.id,
            this.xChange,
            this.yChange,
            this.zChange

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = PositionPacket;