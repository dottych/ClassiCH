const ClientPacket = require('../ClientPacket');

const ServerDisconnectPacket = require('../server/Disconnect');
const ServerBlockPacket = require('../server/Block');

const lists = require('../../Lists');
const utils = require('../../Utils');
const world = require('../../World');
const config = require('../../Config');

class BlockPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.block);

        this.x;
        this.y;
        this.z;
        this.mode;
        this.type;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.x = utils.readUInt16(this.buffer, 1);
        this.y = utils.readUInt16(this.buffer, 3);
        this.z = utils.readUInt16(this.buffer, 5);
        this.mode = this.buffer[7];
        this.type = this.buffer[8];
    }

    handle() {
        // if mode is breaking, set block to air
        if (this.mode === 0x00) this.type = 0x00;
        
        // if block type is out of range
        if (this.type < 0 || this.type > lists.blockLimit) {
            new ServerDisconnectPacket([this.client], "Invalid block!");
            return;
        }

        // if block is out of map range
        let x = utils.parseUInt16(this.x);
        let y = utils.parseUInt16(this.y);
        let z = utils.parseUInt16(this.z);

        if (
            
            (x < 0 || x >= world.x) ||
            (y < 0 || y >= world.y) ||
            (z < 0 || z >= world.z)
            
        ) {
            //new ServerDisconnectPacket([this.client], "Invalid position!");
            return;
        }

        let player = lists.players.get(this.client.id);

        // if player isn't op and PLACES (0x01) an OP block
        if (!player.op && (this.type >= 7 && this.type <= 11)) {
            new ServerDisconnectPacket([this.client], "Invalid block!");
            return;
        }

        // if player places too many blocks
        if (!player.op && player.blockCount > config.self.world.spamCount) {
            new ServerDisconnectPacket([this.client], "Do not spam blocks!");
            return;
        }

        player.lastActivity = Math.round(performance.now());
        player.blockCount++;

        // placing
        if (this.mode === 0x01) {
            const slabIndex = config.self.world.features.slabs.IDs.indexOf(this.type);
            const flowerIndex = config.self.world.features.flowers.IDs.indexOf(this.type);
            const spongeIndex = config.self.world.features.sponges.IDs.indexOf(this.type);
            let placeOriginal = true;

            // slabs
            if (player.commandVars.slabs && slabIndex >= 0) {
                if (world.getBlock(x, y - 1, z) === this.type) {
                    new ServerBlockPacket(

                        [this.client],
                        utils.uInt16(x),
                        utils.uInt16(y),
                        utils.uInt16(z),
                        world.getBlock(x, y, z)
    
                    );
                    world.setBlock(config.self.world.features.slabs.replacementIDs[slabIndex], true, x, y - 1, z);
                    placeOriginal = false;
                }

                if (world.getBlock(x, y + 1, z) === this.type) {
                    new ServerBlockPacket(

                        [this.client],
                        utils.uInt16(x),
                        utils.uInt16(y),
                        utils.uInt16(z),
                        world.getBlock(x, y, z)
    
                    );
                    world.setBlock(config.self.world.features.slabs.replacementIDs[slabIndex], true, x, y, z);
                    world.setBlock(0, true, x, y + 1, z);
                    placeOriginal = false;
                }
            }

            // flowers
            if (player.commandVars.flowers && flowerIndex >= 0 && world.getBlock(x, y-1, z) !== 2) {
                new ServerBlockPacket(

                    [this.client],
                    utils.uInt16(x),
                    utils.uInt16(y),
                    utils.uInt16(z),
                    world.getBlock(x, y, z)

                );
                placeOriginal = false;
            }

            // future suggestion: move sponging to World.js?
            if (player.commandVars.sponges && spongeIndex >= 0) {
                const radius = config.self.world.features.sponges.radius;

                for (let bx = 0-radius; bx <= radius; bx++)
                    for (let by = 0-radius; by <= radius; by++)
                        for (let bz = 0-radius; bz <= radius; bz++) {
                            // if that is the sponge
                            if (bx === 0 && by === 0 && bz === 0) continue;

                            let liquidIndex = config.self.world.features.sponges.liquidIDs.indexOf(world.getBlock(x + bx, y + by, z +bz));

                            if (liquidIndex >= 0)
                                world.setBlock(0, true, x + bx, y + by, z + bz);

                        }
            }

            if (this.type === 2) {
                placeOriginal = false;

                let blockAbove = world.getBlock(x, y+1, z);
                
                if (blockAbove === 2 || blockAbove === 3)
                    world.setBlock(3, true, x, y, z);
                else
                    world.setBlockOthers(this.client, this.type, x, y, z);

                if (world.getBlock(x, y-1, z) === 2)
                    world.setBlock(3, true, x, y-1, z);

            }

            if (placeOriginal) world.setBlockOthers(this.client, this.type, x, y, z);
            
        // breaking
        } else {
            const brokenBlock = world.getBlock(x, y, z);
            const explosiveIndex = config.self.world.features.explosions.IDs.indexOf(brokenBlock);

            world.setBlockOthers(this.client, 0x00, x, y, z);

            // explosives
            if (player.commandVars.explosions && explosiveIndex >= 0)
                world.explode(x, y, z);

            // grass and flowers
            let blockAbove = world.getBlock(x, y+1, z);
            let blockBelow = world.getBlock(x, y-1, z);
            const flowerIndex = config.self.world.features.flowers.IDs.indexOf(blockAbove);

            if (flowerIndex >= 0)
                world.setBlock(0x00, true, x, y+1,z);

            if (blockBelow === 3)
                world.setBlock(2, true, x, y-1,z);

        }
    }
}

module.exports = BlockPacket;