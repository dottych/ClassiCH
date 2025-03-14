const utils = require('./Utils');
const lists = require('./Lists');
const world = require('./World');
const config = require('./Config');

const ServerMessagePacket = require('./packets/server/Message');
const ServerDespawnPacket = require('./packets/server/Despawn');
const ServerTwoWayPingPacket = require('./packets/server/ext/TwoWayPing');

class Player {
    constructor(client, id, name, op, cpe) {
        this.client = client;
        this.id = id;
        this.name = name;
        
        this.op = op;

        this.cpe = cpe;
        this.extensions = {};

        this.message = "";

        this.model = "humanoid";

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
        const otherClients = utils.getOtherPlayerClients(this.client, lists.players);
        new ServerDespawnPacket(otherClients, this.id);
        new ServerMessagePacket(otherClients, 0x00, `&e${this.name} left the game`);

        delete lists.players[this.id];
        
        utils.log(`${this.name} left the game`);
    }

    startPing() {
        new ServerTwoWayPingPacket([this.client], 1, 0);
    }
}

module.exports = Player;