const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class RotationPacket extends ServerPacket {
    constructor(clients, isClient, id, yaw, pitch) {
        super(clients, lists.serverPackets.rotation);

        this.isClient = isClient;

        this.id = id;
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
            this.yaw,
            this.pitch

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = RotationPacket;