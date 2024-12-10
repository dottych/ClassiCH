const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');

class EnvSetWeatherTypePacket extends ServerPacket {
    constructor(clients, weatherType) {
        super(clients, lists.serverPackets.ext.envSetWeatherType);

        this.weatherType = weatherType;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.weatherType

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = EnvSetWeatherTypePacket;