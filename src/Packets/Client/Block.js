const ClientPacket = require('../ClientPacket');

const ServerDisconnectPacket = require('../Server/Disconnect');
const ServerBlockPacket = require('../Server/Block');

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
        //if (this.mode === 0x00) this.type = 0x00;
        
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

        let player = lists.players[this.client.id];

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
            switch (this.type) {
                // slabs
                case 44:
                    if (config.self.world.features.slabs && player.commandVars.slabs) {
                        if (world.getBlock(x, y - 1, z) === 44) {
                            world.setBlock(0x00, true, x, y, z); // replace with serverblockpacket
                            world.setBlock(43, true, x, y - 1, z);
                            
                            break;
                        }

                        if (world.getBlock(x, y + 1, z) === 44) {
                            world.setBlock(0x00, true, x, y + 1, z); // replace with serverblockpacket
                            world.setBlock(43, true, x, y, z);
                            
                            break;
                        }
                    }

                    world.setBlockOthers(this.client, this.type, x, y, z);

                    break;

                // saplings
                case 6:
                    if (
                        
                        config.self.world.features.saplings &&
                        player.commandVars.saplings &&
                        world.getBlock(x, y - 1, z) === 6 &&
                        world.getBlock(x, y - 2, z) === 2 &&
                        x > 1 && x < world.x-2 &&
                        z > 1 && z < world.z-2 &&
                        !world.treeNearby(x, y+1, z)
                        
                    ) {

                        world.tree(x, y - 1, z, true);
                        world.setBlock(3, true, x, y - 2, z);

                    } else
                        world.setBlockOthers(this.client, this.type, x, y, z);

                    break;

                // sponges
                case 19:
                    if (config.self.world.features.sponges && player.commandVars.sponges)
                        for (let bx = -1; bx <= 1; bx++)
                            for (let by = -1; by <= 1; by++)
                                for (let bz = -1; bz <= 1; bz++) {
                                    // if that is the sponge
                                    if (bx === 0 && by === 0 && bz === 0) continue;

                                    let block = world.getBlock(x + bx, y + by, z +bz);

                                    if (block == 8 || block == 9)
                                        world.setBlock(0, true, x + bx, y + by, z + bz);

                                }

                    world.setBlockOthers(this.client, this.type, x, y, z);
                    
                    break;

                // flowers
                case 37:
                case 38:
                    if (world.getBlock(x, y-1, z) !== 2)
                        new ServerBlockPacket(

                            [this.client],
                            utils.uInt16(x),
                            utils.uInt16(y),
                            utils.uInt16(z),
                            world.getBlock(x, y, z)

                        );
                    else
                        world.setBlockOthers(this.client, this.type, x, y, z);

                    break;

                // grass
                case 2:
                    let blockAbove = world.getBlock(x, y+1, z);
                    if (blockAbove === 2 || blockAbove === 3)
                        world.setBlock(3, true, x, y, z);
                    else
                        world.setBlockOthers(this.client, this.type, x, y, z);

                    if (world.getBlock(x, y-1, z) === 2)
                        world.setBlock(3, true, x, y-1, z);

                    break;

                default:
                    world.setBlockOthers(
                
                        this.client,
                        this.type,
                        x,
                        y,
                        z
                        
                    );
                    break;

            }
            
        // breaking
        } else {
            switch (world.getBlock(x, y, z)) {
                // grass
                case 2:
                    world.setBlockOthers(this.client, 0x00, x, y, z);

                    let blockAbove = world.getBlock(x, y+1, z);
                    let blockBelow = world.getBlock(x, y-1, z);

                    if (blockAbove === 37 || blockAbove === 38)
                        world.setBlock(0x00, true, x, y+1,z);

                    if (blockBelow === 3)
                        world.setBlock(2, true, x, y-1,z);

                    break;

                // tnt
                case 46:
                    if (!config.self.world.features.explosions || !player.commandVars.explosions) {
                        world.setBlockOthers(this.client, 0x00, x, y, z);
                        break;
                    }

                    world.setBlockOthers(this.client, 0x00, x, y, z);
                    world.explode(x, y, z);
                    break;

                default:
                    world.setBlockOthers(
                
                        this.client,
                        0x00,
                        x,
                        y,
                        z
                        
                    );
                    break;

            }
        }
    }
}

module.exports = BlockPacket;