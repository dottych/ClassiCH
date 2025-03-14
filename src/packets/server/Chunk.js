const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class ChunkPacket extends ServerPacket {
    constructor(clients, data, progress) {
        super(clients, lists.serverPackets.chunk);

        this.data = data;
        this.progress = progress;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.uInt16(1024), // constant chunk length
            ...this.data,
            this.progress

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = ChunkPacket;