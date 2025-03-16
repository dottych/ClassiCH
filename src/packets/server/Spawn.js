const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class SpawnPacket extends ServerPacket {
    constructor(clients, isClient, id) {
        super(clients, lists.serverPackets.spawn);

        this.isClient = isClient;

        this.id = id;
        this.player = lists.players.get(this.id);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.isClient ? 0xFF : this.id,
            ...utils.string(this.player.name),
            ...this.player.x,
            ...this.player.y,
            ...this.player.z,
            this.player.yaw,
            this.player.pitch

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = SpawnPacket;