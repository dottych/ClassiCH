const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationGarden extends Generation {
    constructor() {
        super("Garden");
        this.author = "marioood";
    }

    generate() {
        const rand = (size) => {
            return Math.round(Math.random() * size);
        }
        
        const sphere = (block, radius, x0, y0, z0, cutoff = 0) => {
            for(let y = -radius; y < radius - cutoff; y++) {
                for(let x = -radius; x < radius; x++) {
                    for(let z = -radius; z < radius; z++) {
                        if(Math.sqrt(x * x + y * y + z * z) < radius) {
                            this.setBlock(block, x + x0, y + y0, z + z0);
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
                        this.setBlock(block, x, y, z);
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
                    this.setBlock(25, x + xOff, y + seg + yOff, z + zOff);
                }
                //thorns
                if(type > 1 && Math.random() > 0.5) {
                    let xThorn = rand(2) - 1;
                    let zThorn = rand(2) - 1;
                    this.setBlock(24, x + xOff + xThorn, y + yOff, z + zOff + zThorn);
                    if(Math.random() > 0.5) {
                        this.setBlock(23, x + xOff + xThorn * 2, y + yOff + rand(2) - 1, z + zOff + zThorn * 2);
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
                this.setBlock(41, x, y - r + 3, z);
                this.setBlock(23, x, y - r + 2, z);
            } else if (type == 1) { //dandelions (horny)
                sphere(36, r, x, y, z);
                sphere(0, r - 1, x, y, z);
                for(let i = 0; i < r - 1; i++) {
                    this.setBlock(17, x, y - i, z)
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
                this.setBlock(25, x + i, y, z);
            }
            for(let i = -r; i < r + 1; i++) {
                this.setBlock(25, x, y, z + i);
            }
            y += r;
            sphere(colors[type], r, x, y, z, r - 1);
            sphere(0, r - 1, x, y, z);
            //cube(0, x - r, y + 1, z - r, x + r, y + r, z + r);
            this.setBlock(41, x, y - r + 4, z);
            this.setBlock(23, x, y - r + 3, z);
            this.setBlock(23, x, y - r + 2, z);
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
            this.setBlock(rand(2) + 14, x, rand(height) + 1, z);
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
                        
                        this.setBlock(block, x, y, z);
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
                            this.setBlock(3, x, height - 1, z);
                        } else {
                            if(Math.random() < 0.03) flower = 1 - flower;
                            flower += 37;
                            if(Math.random() < 0.0025) flower = 6; // spaling
                            this.setBlock(flower, x, height, z);
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
                        this.setBlock(block, x, y, z);
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
}

module.exports = new GenerationGarden();