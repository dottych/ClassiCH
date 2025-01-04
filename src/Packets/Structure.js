class Structure {
    constructor(clients, type) {
        this.clients = clients;
        this.type = type;
        this.buffer; // defined by child packets (Doing this so it isnt a empty class -juggy)
        
    }
    
    constructor() {}

    // overriden by subclasses
    execute() {}
}

module.exports = Structure;