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

        this.types = [
            "land",
            "flat",
            "walls",
            "forest",
            "hill",
            "bop",
            "desert",
            "void"
        ];

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

        if (fs.existsSync(this.file)) {
            // load world
            this.buffer = zlib.gunzipSync(fs.readFileSync(this.file));
            this.oldBuffer = Buffer.from(this.buffer);
        } else {
            // create world
            this.buffer = Buffer.alloc((this.x * this.y * this.z) + 4);
            this.oldBuffer = Buffer.from(this.buffer);

            this.buffer.fill(0); // fill with air
            this.buffer.writeInt32BE(this.x * this.y * this.z, 0); // world size header

            // generate world
            this.generate();
        }

        // save world on interval
		if(config.self.world.saveWorld) { // good for debugging
			setInterval(() => {

				this.save();

			}, config.self.world.saveInterval * 1000);
		}
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

    generate() {
        let type = config.self.world.generationType;
        // if type is invalid
        if (this.types.indexOf(type) < 0) type = "void";

        utils.log(`Generating ${this.x}x${this.y}x${this.z} world of type ${type}`);
        const start = performance.now();

        switch (type) {
            case "land":
                this.generateLand();
                break;

            case "flat":
                this.generateFlat();
                break;

            case "walls":
                this.generateWalls();
                break;
            
            case "forest":
                this.generateForest();
                break;
                        
            case "hill":
                this.generateHill();
                break;

            case "bop":
                this.generateBop();
                break;
				
            case "desert":
                this.generateDesert();
                break;
        }

        utils.log(`Generating done, took ${Math.round(performance.now() - start)}ms`);
    }

    generateLand() {
        const noise = perlin.generatePerlinNoise(this.z, this.x);
        const multiNoise = perlin.generatePerlinNoise(this.z, this.x);
        const miscNoise = perlin.generatePerlinNoise(this.z, this.x);
        const smoothNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});

        // block elevation
        const calculateHeight = (x, z) => {
            return Math.round(noise[z + (x * this.z)] * 4) +
                this.halfY - 5 +
                (multiNoise[z + (x * this.z)] * 2 > 1.25 ? 0 : 1) *
                Math.round(smoothNoise[z + (x * this.z)] * 16) +
                Math.round(miscNoise[z + (x * this.z)] * 3);
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);

                const ground = () => {
                    if (height < this.halfY)
                        if (Math.round(miscNoise[z + (x * this.z)]) === 1)
                            return 12;
                        else
                            return 3;

                    else
                        if (Math.round(miscNoise[z + (x * this.z)]) === 1 && height < this.halfY+3)
                            return 12;
                        else
                            return 2;

                }

                // grass (or dirt/sand underwater)
                this.setBlock(ground(), false, x, height, z);

                // dirt/sand under ground block
                for (let y = height-1; y >= height-2; y--)
                    this.setBlock(ground() === 12 ? 12 : 3, false, x, y, z);

                // stone/ores
                for (let y = height-3; y >= 0; y--)
                    if (Math.floor(Math.random() * 30) === 0)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, false, x, y, z);
                    else
                        this.setBlock(1, false, x, y, z);

                // water
                for (let y = this.halfY; y >= 0; y--)
                    if (this.getBlock(x, y, z) === 0) this.setBlock(8, false, x, y, z);
                    else break;

                // flowers
                if (height > this.halfY+2 && Math.round(miscNoise[z + (x * this.z)] * 2) === 2)
                    if (Math.floor(Math.random() * 4) === 0)
                        this.setBlock(Math.round(Math.random()) + 37, false, x, height+1, z);

                // trees
                if (
                    
                    miscNoise[z + (x * this.z)] * 10 < 2 && 
                    Math.floor(Math.random() * 2) === 0 &&
                    height > this.halfY &&
                    x > 1 && x < this.x-2 &&
                    z > 1 && z < this.z-2 &&
                    !this.treeNearby(x, height+2, z)
                    
                ) {
                    this.setBlock(3, false, x, height, z);
                    this.tree(x, height+1, z);
                }
            }
        
    }

    generateFlat() {
        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                // grass
                this.setBlock(2, false, x, this.halfY, z);

                // dirt
                for (let y = this.halfY-1; y >= this.halfY-3; y--)
                    this.setBlock(3, false, x, y, z);

                // stone
                for (let y = this.halfY-4; y >= 0; y--) {
                    // random ores
                    if (Math.floor(Math.random() * 40) === 39)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, false, x, y, z);
                    else
                        this.setBlock(1, false, x, y, z);

                }
                    
            }
    }

    generateWalls() {
        // wall along X
        for (let x = 0; x < this.x; x++)
        for (let y = 0; y < this.y; y++) {
            this.setBlock(36, false, x, y, 0);
            this.setBlock(36, false, x, y, this.z-1);
        }

        // wall along Z
        for (let z = 0; z < this.z; z++)
            for (let y = 0; y < this.y; y++) {
                this.setBlock(36, false, 0, y, z);
                this.setBlock(36, false, this.x-1, y, z);
            }

        // floor
        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++)
                this.setBlock(36, false, x, 0, z);
    }

    generateForest() {
        const noise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const additionNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 5});
        const miscNoise = perlin.generatePerlinNoise(this.z, this.x);

        // block elevation
        const calculateHeight = (x, z) => {
            return Math.round(noise[z + (x * this.z)] * 16) +
                Math.round(additionNoise[z + (x * this.z)] * 8) +
                this.halfY;
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);

                // grass
                this.setBlock(2, false, x, height, z);

                // dirt under ground block
                for (let y = height-1; y >= height-2; y--)
                    this.setBlock(3, false, x, y, z);

                // stone/ores
                for (let y = height-3; y >= 0; y--)
                    if (Math.floor(Math.random() * 30) === 0)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, false, x, y, z);
                    else
                        this.setBlock(1, false, x, y, z);

                // trees
                if (
                    
                    miscNoise[z + (x * this.z)] * 10 < 5 && 
                    Math.floor(Math.random() * 2) === 0 &&
                    height > this.halfY &&
                    x > 1 && x < this.x-2 &&
                    z > 1 && z < this.z-2 &&
                    !this.treeNearby(x, height+2, z)
                    
                ) {
                    this.setBlock(3, false, x, height, z);
                    this.tree(x, height+1, z);
                }
            }
    }

    generateHill() {
        const noise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});

        // block elevation
        const calculateHeight = (x, z) => {
            return Math.round(noise[z + (x * this.z)] * 32) + this.halfY;
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);

                for (let y = height; y >= 0; y--)
                    this.setBlock(1, false, x, y, z);

            }
    }

    generateBop() {
        if (this.x !== 256 || this.y !== 128 || this.z !== 256) return;

        const bopMap = fs.readFileSync('./bopmap.txt').toString().match(new RegExp(`.{1,64}`, 'g'));

        for (let x = 0; x < 256; x++)
            for (let y = 0; y < 124; y++)
                for (let z = 0; z < 256; z++)
                    this.setBlock(y === 123 ? 2 : 3, false, x, y, z);
        
        for (let z = 0; z < 64; z++)
            for (let x = 0; x < 64; x++) {
                let bopBlock = bopMap[z][x];

                switch (bopBlock) {
                    case "1":
                        for (let bx = 0; bx < 4; bx++)
                            for (let bz = 0; bz < 4; bz++)
                                this.setBlock(3, false, x * 4 + bx, 123, z * 4 + bz);

                        break;

                    case "2":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(6, false, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "3":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(20, false, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "4":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(4, false, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "5":
                        for (let bx = 0; bx < 4; bx++)
                            for (let bz = 0; bz < 4; bz++)
                                this.setBlock(8, false, x * 4 + bx, 123, z * 4 + bz);

                        break;
                }
            }
            
    }
	
	generateDesert() {
		const noise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
		const shift = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
		const junk = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 3});
		const water = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 5});
		const flat = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
		
        const calculateHeight = (x, z) => {
			let xOff = Math.floor(x * (shift[z + (x * this.z)] * 0.1 + 0.2));
			let height = noise[z + (xOff * this.z)];
			height = 1 - Math.sin(Math.abs(height - 0.5) * 4);
			height *= flat[z + (xOff * this.z)] * 6 + 2;
			height += shift[z + (x * this.z)] * 16;
            return Math.round(height) + this.halfY;
        }
		
		const cactus = (x, y, z) => {
			let height = Math.round(Math.random() * 4);
			
			for(let i = 0; i < height; i++) {
				this.setBlock(24, false, x, y + i, z)
			}
		}
		
		const doOre = (x, height, z) => {
			let ore;
			if(Math.random() < 0.75) {
				ore = 14; // gold
			} else if (Math.random() < 0.1) {
				ore = 16; // coal
			} else {
				ore = 15; // iron
			}
			
			this.setBlock(ore, false, x, Math.floor(Math.random() * height) + 1, z);
		}
		
		for(let z = 0; z < this.z; z++) {
			for(let x = 0; x < this.x; x++) {
				let height = calculateHeight(x, z);
				let waterVal = water[z + (x * this.z)]
				if(waterVal < 0.7) {
					//dunes
					for(let y = 1; y < height; y++) {
						if(y > height - 6) {
							this.setBlock(12, false, x, y, z);// ssand
						} else {
							this.setBlock(1, false, x, y, z); // stone
						}
					}
					//junk
					let junkVal = junk[z + (x * this.z)];
					
					if((Math.random() * 0.75) * junkVal > 0.5) {	
						cactus(x, height, z);
					} else if(Math.random() > 0.995) {
						let junkBlock = 6; //sapling

						if(junkVal > 0.75) {
							junkBlock = 40; //red mushroom
						} else if (junkVal < 0.25) {
							junkBlock = 39; //brown mushrom
						}
						this.setBlock(junkBlock, false, x, height, z);
					}
					
				//water
				} else {
					height = Math.round(-waterVal * 32) + this.halfY;
					for(let y = 1; y <= this.halfY; y++) {
						if(height > y) {
							if(height - 3 > y) {
								this.setBlock(1, false, x, y, z); // stone
							} else {
								this.setBlock(13, false, x, y, z); // gravel
							}
						} else {
							this.setBlock(9, false, x, y, z); // water
						}
					}
					
					if(Math.random() * (waterVal * waterVal) > 0.725) {
						this.setBlock(38, false, x, this.halfY + 1, z); // roses
					}
					
					if(Math.random() > 0.9995) {
						this.setBlock(41, false, x, height, z); //gold
					}
					
				}
				
				doOre(x, height - 8, z);
				doOre(x, height - 8, z);
				doOre(x, height - 6, z);
				this.setBlock(11, false, x, 0, z);
			}
		}
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
        if (!config.self.world.features.explosions) return;

        let radius = config.self.world.features.blastRadius;

        for (let bx = 0-radius; bx <= radius; bx++)
            for (let by = 0-radius; by <= radius; by++)
                for (let bz = 0-radius; bz <= radius; bz++) {
                    if (x+bx < 0 || x+bx >= this.x) continue;
                    if (y+by < 0 || y+by >= this.y) continue;
                    if (z+bz < 0 || z+bz >= this.z) continue;

                    let block = this.getBlock(x+bx, y+by, z+bz);

                    if (block !== 0) {
                        if (block === 46) {
                            this.setBlock(0, false, x+bx, y+by, z+bz);
                            this.explode(x+bx, y+by, z+bz);
                        }

                        this.setBlock(0, true, x+bx, y+by, z+bz);
                    }
                }
        
    }

    save() {
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