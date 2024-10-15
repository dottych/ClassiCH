const fs = require('fs');
const zlib = require('zlib');
const perlin = require('perlin-noise');

const ServerBlockPacket = require('./Packets/Server/Block');

const config = require('./Config');
const utils = require('./Utils');

class World {
    constructor() {
        if (!fs.existsSync('./worlds/'))
            fs.mkdirSync('./worlds/');

        this.file = `./worlds/${config.self.world.name}.dat`;

        // world buffer containing world size header and all blocks
        this.buffer;

        // old buffer for change checking
        this.oldBuffer;

        // make sure this always matches with the world itself!!!
        // might fix later
        this.x = config.self.world.size.x;
        this.y = config.self.world.size.y;
        this.z = config.self.world.size.z;

        this.halfY = this.y / 2 - 1;

        this.generationType = "Void";
        this.generationTypeAuthor = "Nizzotch";
        this.generated = false;

        if (fs.existsSync(this.file)) {
            // load world
            this.buffer = zlib.gunzipSync(fs.readFileSync(this.file));
            this.oldBuffer = Buffer.from(this.buffer);

            this.generated = true;
        } else {
            // create world
            this.buffer = Buffer.alloc((this.x * this.y * this.z) + 4);
            this.oldBuffer = Buffer.from(this.buffer);

            this.buffer.fill(0); // fill with air
            this.buffer.writeInt32BE(this.x * this.y * this.z, 0); // world size header
        }
        
        // save world on interval
        setInterval(() => {

            this.save();

        }, config.self.world.saveInterval * 1000);
    }

    setBlock(type, stream, bx, by, bz) {
        if (bx >= this.x || by >= this.y || bz >= this.z) return;
        
        this.buffer.writeUInt8(type, 4 + (bx + bz*this.z/(this.z/this.x) + by*this.z*this.x));

        if (stream)
            new ServerBlockPacket(

                utils.getAllPlayerClients(),
                utils.uInt16(bx),
                utils.uInt16(by),
                utils.uInt16(bz),
                type

            );
    }

    setBlockOthers(client, type, bx, by, bz) {
        this.setBlock(type, false, bx, by, bz);
        
        new ServerBlockPacket(

            utils.getOtherPlayerClients(client),
            utils.uInt16(bx),
            utils.uInt16(by),
            utils.uInt16(bz),
            type

        );
    }

    getBlock(bx, by, bz) {
        return this.buffer[4 + (bx + bz*this.z/(this.z/this.x) + by*this.z*this.x)];
    }

    highestBlock(bx, bz) {
        let by = this.y;

        for (let y = by-1; y >= 0; y--) {
            if (this.getBlock(bx, y, bz) != 0) return y+1;
            by = y;
        }

        // in case every block is air
        return by+1;
    }

    tree(tx, ty, tz, stream = false) {
        const treeHeight = Math.floor(Math.random() * 3) + 4;

        // leaves
        for (let y = 0; y <= 1; y++)
            for (let x = -2; x <= 2; x++)
                for (let z = -2; z <= 2; z++)
                    this.setBlock(18, stream, tx+x, ty+y+treeHeight-3, tz+z);

        for (let y = 0; y <= 1; y++)
            for (let x = -1; x <= 1; x++)
                for (let z = -1; z <= 1; z++)
                    this.setBlock(18, stream, tx+x, ty+y+treeHeight-1, tz+z);

        // leaf corner randomness
        this.setBlock(0, stream, tx-1, ty+treeHeight, tz-1);
        this.setBlock(0, stream, tx+1, ty+treeHeight, tz-1);
        this.setBlock(0, stream, tx+1, ty+treeHeight, tz+1);
        this.setBlock(0, stream, tx-1, ty+treeHeight, tz+1);

        if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx-1, ty+treeHeight-1, tz-1);
        if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx+1, ty+treeHeight-1, tz-1);
        if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx+1, ty+treeHeight-1, tz+1);
        if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx-1, ty+treeHeight-1, tz+1);

        for (let y = 0; y <= 1; y++) {
            if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx-2, ty+treeHeight-3+y, tz-2);
            if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx+2, ty+treeHeight-3+y, tz-2);
            if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx+2, ty+treeHeight-3+y, tz+2);
            if (Math.floor(Math.random() * 6) !== 0) this.setBlock(0, stream, tx-2, ty+treeHeight-3+y, tz+2);
        }

        // logs
        for (let y = 0; y < treeHeight; y++)
            this.setBlock(17, stream, tx, ty+y, tz);
    }

    treeNearby(tx, ty, tz) {
        for (let x = -5; x <= 5; x++)
            for (let y = -5; y <= 5; y++)
                for (let z = -5; z <= 5; z++)
                if (this.getBlock(tx+x, ty+y, tz+z) === 17) return true;

        return false;
    }

    explode(x, y, z) {
        //if (!config.self.world.features.explosions) return;

        let radius = config.self.world.features.explosions.blastRadius;

        for (let bx = 0-radius; bx <= radius; bx++)
            for (let by = 0-radius; by <= radius; by++)
                for (let bz = 0-radius; bz <= radius; bz++) {
                    if (x+bx < 0 || x+bx >= this.x) continue;
                    if (y+by < 0 || y+by >= this.y) continue;
                    if (z+bz < 0 || z+bz >= this.z) continue;

                    const block = this.getBlock(x+bx, y+by, z+bz);
                    const explosiveIndex = config.self.world.features.explosions.IDs.indexOf(block);
                    const avoidIndex = config.self.world.features.explosions.avoidIDs.indexOf(block);

                    if (avoidIndex < 0) {
                        if (explosiveIndex >= 0) {
                            this.setBlock(0, false, x+bx, y+by, z+bz);
                            this.explode(x+bx, y+by, z+bz);
                        }

                        // not sure why it's here twice anymore...
                        // but you know how the saying goes
                        // never remove stuff you think is useless...
                        this.setBlock(0, true, x+bx, y+by, z+bz);
                    }
                }
        
    }

    save() {
        if (!config.self.world.saveWorld) return;

        // if no changes have been done
        if (this.buffer.equals(this.oldBuffer)) return;

        fs.writeFileSync(this.file, zlib.gzipSync(this.buffer));
        utils.log("World saved.");

        this.oldBuffer = Buffer.from(this.buffer);

        return true;
    }

    backup() {
        fs.writeFileSync(`./worlds/${config.self.world.name}_backup${Date.now()}.dat`, zlib.gzipSync(this.buffer));
        utils.log("Backup saved.");
        return true;
    }
}

module.exports = new World();