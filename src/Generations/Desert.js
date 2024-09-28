const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationDesert extends Generation {
    constructor() {
        super("Desert");
        this.author = "marioood";
    }

    generate() {
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
                this.setBlock(24, x, y + i, z)
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
            
            this.setBlock(ore, x, Math.floor(Math.random() * height) + 1, z);
        }
        
        for(let z = 0; z < this.z; z++) {
            for(let x = 0; x < this.x; x++) {
                let height = calculateHeight(x, z);
                let waterVal = water[z + (x * this.z)]
                if(waterVal < 0.7) {
                    //dunes
                    for(let y = 1; y < height; y++) {
                        if(y > height - 6) {
                            this.setBlock(12, x, y, z);// ssand
                        } else {
                            this.setBlock(1, x, y, z); // stone
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
                        this.setBlock(junkBlock, x, height, z);
                    }
                    
                //water
                } else {
                    height = Math.round(-waterVal * 32) + this.halfY;
                    for(let y = 1; y <= this.halfY; y++) {
                        if(height > y) {
                            if(height - 3 > y) {
                                this.setBlock(1, x, y, z); // stone
                            } else {
                                this.setBlock(13, x, y, z); // gravel
                            }
                        } else {
                            this.setBlock(9, x, y, z); // water
                        }
                    }
                    
                    if(Math.random() * (waterVal * waterVal) > 0.725) {
                        this.setBlock(38, x, this.halfY + 1, z); // roses
                    }
                    
                    if(Math.random() > 0.9995) {
                        this.setBlock(41, x, height, z); //gold
                    }
                    
                }
                
                doOre(x, height - 8, z);
                doOre(x, height - 8, z);
                doOre(x, height - 6, z);
                this.setBlock(11, x, 0, z);
            }
        }
    }
}

module.exports = new GenerationDesert();