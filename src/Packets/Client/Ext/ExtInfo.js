const ClientPacket = require('../../ClientPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class ExtInfoPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.ext.info);

        this.appName;
        this.extensionCount;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.appName = utils.readString(this.buffer, 1);
        this.extensionCount = utils.parseUInt16(utils.readUInt16(this.buffer, 1+64));
    }

    handle() {
        this.client.extensionCount = this.extensionCount;
    }
}

module.exports = ExtInfoPacket;