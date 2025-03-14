const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class DespawnPacket extends ServerPacket {
    constructor(clients, id) {
        super(clients, lists.serverPackets.despawn);

        this.id = id;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.id

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = DespawnPacket;