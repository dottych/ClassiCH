class Behaviour {
    constructor(clients, type) {
        this.clients = clients;
        this.type = type;
        this.buffer; // defined by child packets
    }
    
    constructor() {}

    // overriden by subclasses
    execute() {}
}

module.exports = Behaviour;

