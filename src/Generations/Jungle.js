const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationJungle extends Generation {
    constructor() {
        super("Jungle", "marioood");
    }

    generate() {
        //super secret hacker toggle for tall grass.... actual code hwere this is used is at line 150
        const useCustomGrass = false;
        
        const rand = (scale) => {
            return Math.floor(Math.random() * scale);
        }
        const squarish = (block, x0, y0, z0, r) => {
            for(let z = -r; z <= r; z++) {
                for(let x = -r; x <= r; x++) {
                    //skip corners
                    if(z == -r && x == -r) continue;
                    if(z == r && x == -r) continue;
                    if(z == -r && x == r) continue;
                    if(z == r && x == r) continue;
                    //generate in air
                    if(this.getBlock(x0 + x, y0, z0 + z) == 0) {
                        this.setBlock(block, x0 + x, y0, z0 + z);
                    }
                }
            }
        }
        
        const lepidodendron = (x, y, z, age) => {
            let height = age;
            
            for(let t = 0; t < height; t++) {
                this.setBlock(17, x, y + t, z); //log
            }
            
            if(age < 5) {
                //tiny
                let leafHeight = Math.max(height + rand(3) - 1, 2);
                for(let l = 0; l < leafHeight; l++) {
                    this.setBlock(18, x, y + l + height, z); //leaves
                }
            } else if(age < 16) {
                //jouvenile
                let leafEnd = height / 2 + rand(3) - 1;
                for(let l = 1; l < leafEnd; l++) {
                    squarish(18, x, y + height - l, z, 1);
                }
                this.setBlock(18, x, y + height, z); //tuip lieaf
            } else {
                //adult
                //similar "octopus" generation used in tbhe ocean world tpye
                let ageNorm = Math.min((age - 16) / 16, 1);
                let branchChance = 1 - ageNorm * 0.75;
                let hasBranches = false;
                for(let zL = -1; zL <= 1; zL++) {
                    for(let xL = -1; xL <= 1; xL++) {
                        if(zL == 0 && xL == 0) continue; //skip middle
                        if(Math.random() < branchChance) continue;
                        hasBranches = true;
                        //max is 4 if under 24, 3 if over
                        let segLen = rand(3) + age < 24 ? 2 : 1;
                        let segs = Math.abs(rand(6) + 2 - segLen);
                        
                        for(let b = 0; b < segs; b++) {
                            for(let s = 0; s < segLen; s++) {
                                this.setBlock(17, x + (b + 1) * xL, y + b * segLen + s + height, z + (b + 1) * zL);
                            }
                        }
                        
                        let xT = x + xL * segs;
                        let zT = z + zL * segs;
                        let yT = y + height + segLen * segs;
                        let radMod = rand(2);
                        //if(height > 24 + rand(16)) radMod++;
                        squarish(18, xT, yT, zT, 1 + radMod);
                        squarish(18, xT, yT - 1, zT, 2 + radMod);
                        squarish(18, xT, yT - 2, zT, 1 + radMod);
                    }
                }
                //dont generate herobrine trees
                if(!hasBranches) {
                    squarish(18, x, y + height, z, 1);
                    squarish(18, x, y + height - 1, z, 2);
                    squarish(18, x, y + height - 2, z, 1);
                    if(Math.random() > 0.5) {
                        squarish(18, x, y + height - 3, z, 1);
                    }
                }
            }
        }
        //placing blocks and shit cause im in fucking minecraft
        const hills = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
        const hills2 = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const flat = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 8});
        const mountains = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const trees = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        
        const calculateHeight = (x, z) => {
            let hillsB = hills[x + z * this.x] * 8;
            let hills2B = hills2[x + z * this.x] * 16;
            let flatB = flat[x + z * this.x];
            let mountainsB = mountains[x + z * this.x];
            let mountHillsB = hills2[z + x * this.z] * 16;
            let swampHillsB = (hills[z + x * this.z] * 8) * (1 - flatB) * (1 - mountainsB);
            return (hillsB + hills2B) * flatB + this.halfY - 6 + (mountainsB > 0.5 ? mountHillsB : 0) + swampHillsB;
        }
        
        for(let z = 0; z < this.z; z++) {
            for(let x = 0; x < this.x; x++) {
                let height = Math.round(calculateHeight(x, z));
                for(let y = 0; y < Math.max(height, this.halfY + 1); y++) {
                    let block = 1;
                    if(y >= height) {
                        block = 9; //water
                    } else {
                        let variation = trees[z + x * this.z];
                        if(y == 0) {
                            block = 11; // lava
                        } else if(height > this.halfY) {
                            if(height < this.halfY + variation * 5 - 1) {
                                if(y > height - 4) {
                                    block = 12; // sand
                                }
                            } else if(y == height - 1) {
                                block = 2; // grass
                            } else if(y > height - variation * 6 - 1) {
                                block = 3; //dirts
                            }
                        } else if(y > height - 4) {
                            variation = Math.floor(variation * 4) % 3;
                            if(variation == 1) {
                                block = 3; //dirt
                            } else if(variation == 2) {
                                block = 13; //gravel
                            } else {
                                block = 12; //sand
                            } 
                        }
                    }
                    //ore
                    if(block == 1) {
                        let yNorm = 1 - (y / this.y);
                        if(yNorm > Math.random() && rand(16) == 0) {
                            block = 14 + rand(2);
                        }
                    }
                    this.setBlock(block, x, y, z);
                }
            }
        }
        const dist = 8; // distance from edge
        //area for structure gen
        //later me here. im pretty sure thats not how you calculate area
        const area = (this.x - dist * 2) + (this.z - dist * 2);
        //dandelions, roses, and...... grass?!?!?!
        const flowers = [37, 38, 95];
        //flowers
        for(let i = 0; i < area / 2; i++) {
            let x = rand(this.x);
            let z = rand(this.z);
            let flowerCount = rand(64) + 4;
            
            let block;
            if(useCustomGrass) {
                block = flowers[rand(3)];
            } else {
                block = flowers[rand(2)];
            }
            for(let f = 0; f < flowerCount; f++) {
                let y = Math.round(calculateHeight(x, z));
                if(this.getBlock(x, y - 1, z) == 2) {
                    this.setBlock(block, x, y, z);
                }
                let xOff = rand(4) + 1;
                let zOff = rand(4) + 1;
                if(Math.random() > 0.5) xOff *= -1;
                if(Math.random() > 0.5) zOff *= -1;
                x += xOff;
                z += zOff;
                if(Math.abs(x % this.x) != x) break;
                if(Math.abs(z % this.z) != z) break;
            }
        }
        //trees
        const maxSize = Math.min(this.halfY / 2, 100);
        for(let i = 0; i < area; i++) {
            let x = rand(this.x - dist * 2) + dist;
            let z = rand(this.z - dist * 2) + dist;
            let y = Math.round(calculateHeight(x, z));
            let variation = trees[x + z * this.x];
            if(this.getBlock(x, y, z) == 17) continue; // dont generate inside of another tree
            if(variation < Math.random() / 2) {
                //generate on grass
                if(this.getBlock(x, y - 1, z) != 2) continue;
                this.tree(x, y, z);
            } else {
                //limit height so tree doesnt crash through skybox
                lepidodendron(x, y, z, rand(maxSize) + 1);
            }
            this.setBlock(3, x, y - 1, z); // dirt
        }
    }
}

module.exports = new GenerationJungle();