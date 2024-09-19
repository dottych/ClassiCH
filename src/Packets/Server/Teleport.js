const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');

class TeleportPacket extends ServerPacket {
    constructor(clients, isClient, id, x, y, z, yaw, pitch) {
        super(clients, lists.serverPackets.teleport);

        this.isClient = isClient;

        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
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
            ...this.x,
            ...this.y,
            ...this.z,
            this.yaw,
            this.pitch

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = TeleportPacket;