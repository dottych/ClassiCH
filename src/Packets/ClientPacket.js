class ClientPacket {
    constructor(client, buffer, type) {
        this.client = client;
        this.buffer = buffer;
        this.type = type;
    }
}

module.exports = ClientPacket;