const ServerPacket = require('../ServerPacket');
const lists = require('../../Lists');
const utils = require('../../Utils');

class MessagePacket extends ServerPacket {
    constructor(clients, id, message) {
        super(clients, lists.serverPackets.message);

        this.id = id;
        this.message = message;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.id,
            ...utils.string(this.message)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = MessagePacket;