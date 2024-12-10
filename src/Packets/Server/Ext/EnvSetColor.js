const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class EnvSetColorPacket extends ServerPacket {
    constructor(clients, colorType, r, g, b) {
        super(clients, lists.serverPackets.ext.envSetColor);

        this.colorType = colorType;
        this.r = r;
        this.g = g;
        this.b = b;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.colorType,
            ...utils.uInt16(this.r),
            ...utils.uInt16(this.g),
            ...utils.uInt16(this.b)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = EnvSetColorPacket;