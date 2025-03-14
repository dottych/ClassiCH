const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');
const config = require('../../../Config');

class ExtInfoPacket extends ServerPacket {
    constructor(clients) {
        super(clients, lists.serverPackets.ext.info);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.string(config.softwareRaw),
            ...utils.uInt16(Object.entries(lists.supportedExtensions).length)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = ExtInfoPacket;