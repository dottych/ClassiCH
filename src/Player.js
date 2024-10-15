const utils = require('./Utils');
const lists = require('./Lists');
const world = require('./World');
const config = require('./Config');

const ServerMessagePacket = require('./Packets/Server/Message');
const ServerDespawnPacket = require('./Packets/Server/Despawn');

class Player {
    constructor(client, id, name, op, cpe) {
        this.client = client;
        this.id = id;
        this.name = name;
        
        this.op = op;

        this.cpe = cpe;
        this.extensions = {};

        this.message = "";

        this.msgCount = 0;
        this.blockCount = 0;
        this.longMsgCount = 0;

        this.joined = Math.round(performance.now());

        if (config.self.world.spawn.x >= 0)
            this.x = utils.uInt16(config.self.world.spawn.x * 32 + 16);
        else
            this.x = utils.uInt16(world.x / 2 * 32 + 16);

        if (config.self.world.spawn.y >= 0)
            this.y = utils.uInt16(config.self.world.spawn.y * 32 + 16);
        else
            // get highest block at which the player can spawn, add 51 (height)
            this.y = utils.uInt16((world.highestBlock(world.x / 2, world.z / 2) + 1) * 32);
        
        if (config.self.world.spawn.z >= 0)
            this.z = utils.uInt16(config.self.world.spawn.z * 32 + 16);
        else
            this.z = utils.uInt16(world.z / 2 * 32 + 16);

        // looking straight
        this.yaw = 0;
        this.pitch = 0;

        // custom variables for commands
        this.commandVars = {

            explosions: config.self.world.features.explosions.default,
            slabs: config.self.world.features.slabs.default,
            flowers: config.self.world.features.flowers.default,
            sponges: config.self.world.features.sponges.default
            
        };

        setInterval(() => {
            this.msgCount = 0;
        }, config.self.messages.spamInterval * 1000);

        setInterval(() => {
            this.blockCount = 0;
        }, config.self.world.spamInterval * 1000);
    }

    disconnect() {
        // remove this player for other clients and say message
        new ServerDespawnPacket(utils.getOtherPlayerClients(this.client), this.id);
        new ServerMessagePacket(utils.getOtherPlayerClients(this.client), 0x00, `&e${this.name} left the game`);

        delete lists.players[this.id];
        
        utils.log(`${this.name} left the game`);
    }

    hasExtension(extension, version) {
        return this.extensions[extension] != undefined && this.extensions[extension] === version;
    }
}

module.exports = Player;