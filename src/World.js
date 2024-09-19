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
            "garden",
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

        //toggle world saves, good for debugging
        this.saveWorld = config.self.world.saveWorld;

        //force saves if saveWorld is missing from config.json
        if (this.saveWorld == undefined)
            this.saveWorld = true;
        
        // save world on interval
        if (this.saveWorld) {
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
                
            case "garden":
                this.generateGarden();
                break;

            case "void":
                /*new (require('./Generation'))(
            
                    this.buffer,
                    this.x,
                    this.y,
                    this.z,
                    this.setBlock,
                    this.getBlock
                    
                ).generate();*/
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
    
    generateGarden() {
        const rand = (size) => {
            return Math.round(Math.random() * size);
        }
        
        const sphere = (block, radius, x0, y0, z0, cutoff = 0) => {
            for(let y = -radius; y < radius - cutoff; y++) {
                for(let x = -radius; x < radius; x++) {
                    for(let z = -radius; z < radius; z++) {
                        if(Math.sqrt(x * x + y * y + z * z) < radius) {
                            this.setBlock(block, false, x + x0, y + y0, z + z0);
                        }
                    }
                }
            }
        }
        
        const cube = (block, x0, y0, z0, x1, y1, z1) => {
            if(x0 > x1) {
                let temp = x0;
                x0 = x1;
                x1 = temp;
            }
            if(y0 > y1) {
                let temp = y0;
                y0 = y;
                y1 = temp;
            }
            if(z0 > z1) {
                let temp = z0;
                z0 = z1;
                z1 = temp;
            }
            for(let y = y0; y < y1; y++) {
                for(let x = x0; x < x1; x++) {
                    for(let z = z0; z < z1; z++) {
                        this.setBlock(block, false, x, y, z);
                    }
                }
            }
        }
        const bigFlower = (x, y, z, type) => {
            let segCount = rand(Math.round(density[z + (x * this.z)] * 12)) + 4;
            let yOff = 0;
            let xOff = 0;
            let zOff = 0;
            
            for(let stem = 0; stem < segCount; stem++) {
                let height = rand(4) + 1;
                
                for(let seg = 0; seg < height; seg++) {
                    this.setBlock(25, false, x + xOff, y + seg + yOff, z + zOff);
                }
                //thorns
                if(type > 1 && Math.random() > 0.5) {
                    let xThorn = rand(2) - 1;
                    let zThorn = rand(2) - 1;
                    this.setBlock(24, false, x + xOff + xThorn, y + yOff, z + zOff + zThorn);
                    if(Math.random() > 0.5) {
                        this.setBlock(23, false, x + xOff + xThorn * 2, y + yOff + rand(2) - 1, z + zOff + zThorn * 2);
                    }
                }
                yOff += height;
                xOff += rand(2) - 1;
                zOff += rand(2) - 1;
            }
            x += xOff;
            y += yOff;
            z += zOff;
            let r = Math.round(segCount / 3) + 1;
            y += r - 1;
            
            if(type == 0) { //dandelions
                sphere(23, r, x, y, z, r);
                sphere(0, r - 1, x, y, z);
                //cube(0, x - r, y - r + 3, z - r, x + r, y + r, z + r);
                this.setBlock(41, false, x, y - r + 3, z);
                this.setBlock(23, false, x, y - r + 2, z);
            } else if (type == 1) { //dandelions (horny)
                sphere(36, r, x, y, z);
                sphere(0, r - 1, x, y, z);
                for(let i = 0; i < r - 1; i++) {
                    this.setBlock(17, false, x, y - i, z)
                }
            } else { //roses
                let wool = 27 //cyan flowers
                
                if(type == 2) {
                    wool = 21; //red
                }
                sphere(wool, r, x, y, z, 1);
                sphere(0, r - 1, x, y, z);
                //cube(0, x - r, y + r - 1, z - r, x + r, y + r, z + r);
                
                if(r < 3) return;
                
                let dir = rand(4);
                let x0 = 0;
                let z0 = 0;
                let x1 = 1;
                let z1 = 1;
                
                if(dir == 0) {
                    x1 = r - 1;
                } else if(dir == 1) {
                    z1 = r - 1;
                } else if(dir == 2) {
                    x1 = 2 - r;
                    x0 = 1;
                } else if(dir == 3) {
                    z1 = 2 - r;
                    z0 = 1;
                } //5th rotation is just one thing in the center
                cube(wool, x + x0, y - r + 2, z + z0, x + x1, y + r - 1, z + z1);
            }
        }
        
        const bigLotus = (x, y, z, type) => {
            let r = 3 + rand(2);
            let colors = [23, 36, 21, 27];
            //leaves
            for(let i = -r; i < r + 1; i++) {
                this.setBlock(25, false, x + i, y, z);
            }
            for(let i = -r; i < r + 1; i++) {
                this.setBlock(25, false, x, y, z + i);
            }
            y += r;
            sphere(colors[type], r, x, y, z, r - 1);
            sphere(0, r - 1, x, y, z);
            //cube(0, x - r, y + 1, z - r, x + r, y + r, z + r);
            this.setBlock(41, false, x, y - r + 4, z);
            this.setBlock(23, false, x, y - r + 3, z);
            this.setBlock(23, false, x, y - r + 2, z);
        }
        
        const ground = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 5});
        const ground2 = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const type = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const density = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const water = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        let lotusQueue = [];
        
        const getHeight = (x, z) => {
            let height = ground[z + (x * this.z)] * 8;
            height += ground2[z + (x * this.z)] * 8;
            return Math.round(height) + this.halfY;
        }
        
        const doOre = (x, height, z) => {
            this.setBlock(rand(2) + 14, false, x, rand(height) + 1, z);
        }
        
        //ground
        for(let z = 0; z < this.z; z++) {
            for(let x = 0; x < this.x; x++) {
                let waterVal = water[z + (x * this.z)];
                let flower = type[z + (x * this.z)];
                flower = Math.round(flower);
                
                if(waterVal < 0.7) {
                    let height = getHeight(x, z);
                    for(let y = 0; y < height; y++) {
                        let block = 1;
                        if(y > height - 4) block = 3;
                        if(y == height - 1) block = 2;
                        if(y == 0) block = 9;
                        
                        this.setBlock(block, false, x, y, z);
                    }
                    doOre(x, height - 6, z);
                    
                    if(density[z + (x * this.z)] / 2 + Math.random() < 0.5) {
                        if(Math.random() < 0.015) {
                            const dist = 8;
                            if(x < dist || z < dist) continue;
                            if(x > this.x - dist || z > this.z - dist) continue;
                            flower *= 2;
                            flower += Math.random() < 0.1 ? 1 : 0;
                            bigFlower(x, height, z, flower);
                            this.setBlock(3, false, x, height - 1, z);
                        } else {
                            if(Math.random() < 0.03) flower = 1 - flower;
                            flower += 37;
                            if(Math.random() < 0.0025) flower = 6; // spaling
                            this.setBlock(flower, false, x, height, z);
                        }
                    }
                //water
                } else {
                    let height = this.halfY + waterVal * -16;
                    for(let y = 0; y <= this.halfY; y++) {
                        let block = 9;
                        if(height > y) {
                            if(y == 0) {
                                block = 9;
                            } else if(height - 6 > y) {
                                block = 1;
                            } else if(ground[z + (x * this.z)] > 0.5) {
                                block = 12;
                            } else {
                                block = 13;
                            }
                        }
                        this.setBlock(block, false, x, y, z);
                    }
                    doOre(x, height - 3, z);
                    doOre(x, height - 3, z);
                    
                    if(waterVal > 0.725) {
                        if(Math.random() < 0.0025) {
                            flower *= 2;
                            flower += Math.random() < 0.25 ? 1 : 0;
                            
                            lotusQueue.push([x, z, flower]);
                        }
                    }
                }
            }
        }
        //doing this in the regular block loop makes some of the blocks get overwritten... and i dont want to loop over everything twice to find water
        const dist = 8;
        
        for(let i = 0; i < lotusQueue.length; i++) {
            let x = lotusQueue[i][0];
            let z = lotusQueue[i][1];
            if(x < dist || z < dist) continue;
            if(x > this.x - dist || z > this.z - dist) continue;
            bigLotus(x, this.halfY, z, lotusQueue[i][2]);
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