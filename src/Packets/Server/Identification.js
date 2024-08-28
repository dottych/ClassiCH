const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class IdentificationPacket extends ServerPacket {
    constructor(clients, pvn, title, description, op) {
        super(clients, lists.serverPackets.identification);

        this.pvn = pvn;
        this.title = title;
        this.description = description;
        this.op = op;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.pvn,
            ...utils.string(this.title),
            ...utils.string(this.description),
            this.op ? 0x64 : 0x00

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = IdentificationPacket;