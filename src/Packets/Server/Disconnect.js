const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class DisconnectPacket extends ServerPacket {
    constructor(clients, reason) {
        super(clients, lists.serverPackets.disconnect);

        this.reason = reason;

        utils.log(`Kick reason: ${reason}`);

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.string(this.reason)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = DisconnectPacket;