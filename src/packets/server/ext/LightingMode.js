const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');

class LightingModePacket extends ServerPacket {
    constructor(clients, mode, locked) {
        super(clients, lists.serverPackets.ext.lightingMode);

        this.mode = mode;
        this.locked = locked;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.mode,
            this.locked ? 1 : 0

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = LightingModePacket;