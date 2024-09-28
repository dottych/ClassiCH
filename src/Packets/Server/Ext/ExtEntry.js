const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');
const config = require('../../../Config');

class ExtEntryPacket extends ServerPacket {
    constructor(clients, extensionName, extensionVersion) {
        super(clients, lists.serverPackets.ext.entry);

        this.extensionName = extensionName;
        this.extensionVersion = extensionVersion;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.string(this.extensionName),
            ...utils.uInt32(this.extensionVersion)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = ExtEntryPacket;