const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class SetMapEnvUrlPacket extends ServerPacket {
    constructor(clients, url) {
        super(clients, lists.serverPackets.ext.setMapEnvUrl);

        this.url = url;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            ...utils.string(this.url)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = SetMapEnvUrlPacket;