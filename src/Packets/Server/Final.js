const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');
const config = require('../../Config');

class FinalPacket extends ServerPacket {
    constructor(clients) {
        super(clients, lists.serverPackets.final);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.uInt16(config.self.world.size.x),
            ...utils.uInt16(config.self.world.size.y),
            ...utils.uInt16(config.self.world.size.z)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = FinalPacket;