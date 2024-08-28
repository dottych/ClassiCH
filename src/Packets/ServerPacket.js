class ServerPacket {
    constructor(clients, type) {
        this.clients = clients;
        this.type = type;
        this.buffer; // defined by child packets
    }

    // called by child packets
    send() {
        for (let client of this.clients) client.write(this.buffer);
    }
}

module.exports = ServerPacket;