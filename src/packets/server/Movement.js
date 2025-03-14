const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class MovementPacket extends ServerPacket {
    constructor(clients, isClient, id, xChange, yChange, zChange, yaw, pitch) {
        super(clients, lists.serverPackets.movement);

        this.isClient = isClient;

        this.id = id;
        this.xChange = xChange;
        this.yChange = yChange;
        this.zChange = zChange;
        this.yaw = yaw;
        this.pitch = pitch;

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
            this.zChange,
            this.yaw,
            this.pitch

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = MovementPacket;