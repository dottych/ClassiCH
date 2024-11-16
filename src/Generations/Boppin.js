const fs = require('fs');
const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationBoppin extends Generation {
    constructor() {
        super("Boppin", "marioood");
    }

    generate() {
        //copied from Bop.js
        if (this.x !== 256 || this.z !== 256) return;

        if (!fs.existsSync('./bopmap.txt')) {
            console.log("bopmap.txt is missing!");
            return;
        }

        const bopMap = fs.readFileSync('./bopmap.txt').toString().match(new RegExp(`.{1,64}`, 'g'));
        
        //not coppied
        const AIR = '0';
        const PATH = '1';
        const DOOR = '2';
        const GLASS = '3';
        const WALL = '4';
        const WATER = '5';
        
        const lerp = (a, b, t) => {
            return a + (b - a) * t;
        };
        
        const bilin = (base) => {
            //funky implementation of bilinear interpolation
            //stretches out the width, then stretches the height in separate stages
            
            //preprocessing for x interpolation
            let stretched = [64];
            const scale = 256 / 64;
            
            for(let z = 0; z < 64; z++) {
                stretched[z] = [256];
                for(let x = 0; x < 256; x++) {
                    //weirdly written long function sorrrry
                    //the - 0.5 and + 2 are to make it centered
                    stretched[z][x] = lerp(
                        base[z][Math.max(Math.floor(x / scale - 0.5), 0)],
                        base[z][Math.min(Math.ceil(x / scale  - 0.5), 63)],
                        ((x + 2) % scale) / scale
                    );
                }
            }
            //actual interpolated depth
            let output = [256];
            for(let z = 0; z < 256; z++) {
                output[z] = [256];
                for(let x = 0; x < 256; x++) {
                    output[z][x] = lerp(
                        stretched[Math.max(Math.floor(z / scale - 0.5), 0)][x],
                        stretched[Math.min(Math.ceil(z / scale  - 0.5), 63)][x],
                        ((z + 2) % scale) / scale
                    );
                }
            }
            return output;
        };
        
        //isolated water copied from file - uninterpolated
        let waterDepthBase = [64];
        
        for(let z = 0; z < 64; z++) {
            waterDepthBase[z] = [64];
            for(let x = 0; x < 64; x++) {
                if(bopMap[z][x] == WATER) {
                    waterDepthBase[z][x] = 0;
                } else {
                    waterDepthBase[z][x] = 1;
                }
            }
        }
        
        let waterDepth = bilin(waterDepthBase);;
        
        //isolated water copied from file - uninterpolated
        let flatnessBase = [64];
        
        for(let z = 0; z < 64; z++) {
            flatnessBase[z] = [64];
            for(let x = 0; x < 64; x++) {
                if(bopMap[z][x] == AIR) {
                    flatnessBase[z][x] = 1;
                } else {
                    flatnessBase[z][x] = 0;
                }
            }
        }
        let flatnessBlur = [64];
        //blur image
        const radius = 2;
        const average = radius * radius * 4;
        for(let z = 0; z < 64; z++) {
            flatnessBlur[z] = [64];
            for(let x = 0; x < 64; x++) {
                flatnessBlur[z][x] = 0;
                //kernal
                for(let zB = -radius; zB < radius; zB++) {
                    for(let xB = -radius; xB < radius; xB++) {
                        flatnessBlur[z][x] += flatnessBase[Math.min(Math.max(z + zB, 0), 63)][Math.min(Math.max(x + xB, 0), 63)];
                    }
                }
                //normalize
                flatnessBlur[z][x] /= average;
                //make more lfat
                flatnessBlur[z][x] = Math.max(flatnessBlur[z][x] - 0.5, 0);
            }
        }
        
        let flatness = bilin(flatnessBlur);
        //end of bilinear interp
        //start of wall connection
        
        //check grid
        //-1,-1; 0,-1; 1,-1
        //-1, 0; XXXX; 1, 0
        //-1, 1; 0, 1; 1, 1
        
        //connections
        let connections = [64];
        
        const isWall = (x, z) => {
            let thing = bopMap[Math.min(Math.max(z, 0), 63)][Math.min(Math.max(x, 0), 63)]
            return thing == WALL || thing == GLASS;
        };
        const isDoor = (x, z) => {
            let thing = bopMap[Math.min(Math.max(z, 0), 63)][Math.min(Math.max(x, 0), 63)]
            return thing == DOOR;
        };
        //straight
        const checkWS = (x, z, xOff, zOff, mult) => {
            if(isWall(x + xOff, z + zOff)) {
                connections[z][x].push([xOff * mult, zOff * mult, false]);
            }
        };
        //diag
        const checkWD = (x, z, xOff, zOff, mult) => {
            if(!isWall(x + xOff, z) && !isWall(x, z + zOff)) {
                checkWS(x, z, xOff, zOff, mult);
            }
        };
        //corner
        const checkWC = (x, z, xOff, zOff, mult) => {
            if(isWall(x + xOff, z) && isWall(x, z + zOff) && isWall(x + xOff, z + zOff)) {
                connections[z][x].push([xOff * mult, zOff * mult, true]);
            }
        };
        
        const checkDS = (x, z, xOff, zOff) => {
            if(isDoor(x + xOff, z + zOff)) {
                connections[z][x].push([xOff, zOff, false]);
            }
        };
        
        const checkDD = (x, z, xOff, zOff) => {
            if(!isDoor(x + xOff, z) && !isDoor(x, z + zOff)) {
                checkDS(x, z, xOff, zOff);
            }
        };

        const checkDC = (x, z, xOff, zOff) => {
            if(isDoor(x + xOff, z) && isDoor(x, z + zOff) && isDoor(x + xOff, z + zOff)) {
                connections[z][x].push([xOff, zOff, true]);
            }
        };
        //door on the edge of a wall
        const checkDE = (x, z, xOff, zOff) => {
            if(isDoor(x, z + zOff) && isWall(x + xOff, z)) {
                connections[z][x].push([xOff * 2, zOff, true]);
            }
        };
        const checkDE2 = (x, z, xOff, zOff) => {
            if(isWall(x, z + zOff) && isDoor(x + xOff, z)) {
                connections[z][x].push([xOff, zOff * 2, true]);
            }
        };
        
        //check cells
        for(let z = 0; z < 64; z++) {
            connections[z] = [64];
            for(let x = 0; x < 64; x++) {
                connections[z][x] = [];
                //stored as
                //[[offsX, offsZ, isCorner?],[offsX, offsZ, isCorner?]...]
                if(isWall(x, z)) {
                    checkWS(x, z, 0, -1, 1);
                    checkWS(x, z, 1, 0, 1);
                    checkWS(x, z, 0, 1, 1);
                    checkWS(x, z, -1, 0, 1);
                    checkWD(x, z, -1, -1, 1);
                    checkWD(x, z, 1, -1, 1);
                    checkWD(x, z, -1, 1, 1);
                    checkWD(x, z, 1, 1, 1);
                    checkWC(x, z, -1, -1, 1);
                    checkWC(x, z, 1, -1, 1);
                    checkWC(x, z, -1, 1, 1);
                    checkWC(x, z, 1, 1, 1);
                } else if(isDoor(x, z)) {
                    //this code sucks - too bad!!
                    checkWS(x, z, 0, -1, 2);
                    checkWS(x, z, 1, 0, 2);
                    checkWS(x, z, 0, 1, 2);
                    checkWS(x, z, -1, 0, 2);
                    checkWD(x, z, -1, -1, 2);
                    checkWD(x, z, 1, -1, 2);
                    checkWD(x, z, -1, 1, 2);
                    checkWD(x, z, 1, 1, 2);
                    checkWC(x, z, -1, -1, 2);
                    checkWC(x, z, 1, -1, 2);
                    checkWC(x, z, -1, 1, 2);
                    checkWC(x, z, 1, 1, 2);
                    checkDS(x, z, 0, -1);
                    checkDS(x, z, 1, 0);
                    checkDS(x, z, 0, 1);
                    checkDS(x, z, -1, 0);
                    checkDD(x, z, -1, -1);
                    checkDD(x, z, 1, -1);
                    checkDD(x, z, -1, 1);
                    checkDD(x, z, 1, 1);
                    checkDC(x, z, -1, -1);
                    checkDC(x, z, 1, -1);
                    checkDC(x, z, -1, 1);
                    checkDC(x, z, 1, 1);
                    checkDE2(x, z, -1, -1);
                    checkDE(x, z, 1, -1);
                    checkDE2(x, z, 1, -1);
                    checkDE(x, z, 1, 1);
                    checkDE2(x, z, 1, 1);
                    checkDE(x, z, -1, 1);
                    checkDE2(x, z, -1, 1);
                    checkDE(x, z, -1, -1);
                }
            }
        }
        //end of wall connection
        //start of actual generation
        const shift = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const hilly = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
        const chunky = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 5});
        const gravel = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
        
        const calculateHeight = (x, z) => {
            let depthN = waterDepth[z][x];
            //square it so its smoother
            depthN = 1 - depthN;
            depthN = 1 - (depthN * depthN);
            let chunkyN = chunky[x + z * this.x];
            let hillyN = hilly[x + z * this.x] * (1 - depthN) * (chunkyN < 0.5 ? 1 : 4);
            let shiftN = (shift[x + z * this.x] * 6 - 2) * flatness[z][x];
            
            let height = (depthN - 0.5) * 8 + this.halfY + shiftN - hillyN;
            if(height > this.halfY + 4) {
                let tile = bopMap[Math.floor(z / 4)][Math.floor(x / 4)]
                if(tile == PATH || tile == DOOR) {
                    return this.halfY + 4;
                }
            }
            return height;
        };
        
        const cube = (block, x0, y0, z0, xS, yS, zS) => {
            for(let z = 0; z < zS; z++) {
                for(let x = 0; x < xS; x++) {
                    for(let y = 0; y < yS; y++) {
                        this.setBlock(block, x + x0, y + y0, z + z0);
                    }
                }
            }
        };
        
        for(let z = 0; z < 256; z++) {
            for(let x = 0; x < 256; x++) {
                let block = 1;
                let height = Math.round(calculateHeight(x, z));
                for(let y = 0; y < Math.max(this.halfY + 1, height); y++) {
                    if(y >= height) {
                        block = 9; //water
                    } else {
                        if(y == 0) {
                            block = 11; // lava
                        } else if(y < height - 3) {
                            if(Math.floor(Math.random() * 100) == 0) {
                                block = 14 + Math.floor(Math.random() * 3); //ore
                            } else {
                                block = 1; // stone
                            }
                        } else if(height > this.halfY + 2) {
                            if(y == height - 1) {
                                block = 2; // grass
                            } else {
                                block = 3; //dirts
                            }
                        } else {
                            if(gravel[x + z * this.x] + shift[x + z * this.x] < 1 || y > this.halfY) {
                                block = 12; // sand
                            } else {
                                block = 13; //gravel
                            }
                        }
                    }
                    this.setBlock(block, x, y, z);
                }
            }
        }
        
        const structDist = 4;
        //trees
        for(let i = 0; i < this.x + this.z; i++) {
            let x = Math.max(Math.min(Math.floor(Math.random() * this.x), this.x - structDist), structDist);
            let z = Math.max(Math.min(Math.floor(Math.random() * this.z), this.z - structDist), structDist);
            if(flatness[z][x] < Math.random()) continue;
            
            let height = Math.floor(calculateHeight(x, z));
            if(this.getBlock(x, height, z) != 2) continue; // check for grass
            if(this.getBlock(x, height + 1, z) != 0) continue; // generating in a wall?
            this.tree(x, height + 1, z);
            this.setBlock(3, x, height, z); //dirt
        }

        //flowers
        for(let i = 0; i < (this.x + this.z) / 2; i++) {
            let x = Math.floor(Math.random() * this.x);
            let z = Math.floor(Math.random() * this.z);
            if(flatness[z][x] < Math.random()) continue;
            
            let amount = Math.floor(Math.random() * 120) + 8;
            let type = Math.floor(Math.random() * 2);
            for(let f = 0; f < amount; f++) {
                let height = Math.round(calculateHeight(x, z));
                if(this.getBlock(x, height - 1, z) != 2) continue; // check for grass
                if(this.getBlock(x, height, z) != 0) continue; // generating in a wall?
                this.setBlock(37 + type, x, height, z); //dandelion or rose
                x += Math.round((Math.random() - 0.5) * 8);
                z += Math.round((Math.random() - 0.5) * 8);
                if(x % this.x != x || z % this.z != z) break; //stop if out of bounds
                if(Math.abs(x) != x || Math.abs(z) != z) break; //stop if out onegative
            }
        }
        
        //walls and lfoors
        const floor = this.halfY + 4
        const doWall = (block, x, z, offs, height) => {
            cube(block, x * 4 + 1, floor + offs, z * 4 + 1, 2, height, 2);
            for(let c = 0; c < connections[z][x].length; c++) {
                let seg = connections[z][x][c];
                //THIS OVERLAPS WITH BASE COLUMN - INEFFICIENT!!!
                cube(block, x * 4 + 1 + seg[0], floor + offs, z * 4 + 1 + seg[1], 2, height, 2);
                if(seg[0] != 0 && seg[1] != 0) {
                    if(seg[2]) {
                        //is a corner
                        cube(block, x * 4 + 1 + seg[0], floor + offs, z * 4 + 1 + seg[1], 2, height, 2);
                    } else {
                        // is a diag
                        //door diagonals hack
                        if(Math.abs(seg[0]) > 1) {
                            seg[0] /= 2;
                            seg[1] /= 2;
                            cube(block, x * 4 + 1 + seg[0] * 2, floor + offs, z * 4 + 1 + seg[1] * 2, 2, height, 2);
                            cube(block, x * 4 + 1 + seg[0] * 3, floor + offs, z * 4 + 1 + seg[1] * 3, 2, height, 2);
                        } else {
                            cube(block, x * 4 + 1 + seg[0] * 2, floor + offs, z * 4 + 1 + seg[1] * 2, 2, height, 2);
                        }
                    }
                }
            }
        };

        for(let z = 0; z < 64; z++) {
            for(let x = 0; x < 64; x++) {
                switch(bopMap[z][x]) {
                    case PATH: 
                        cube(4, x * 4, floor - 4, z * 4, 4, 3, 4); // botton base cobbleostn
                        cube(43, x * 4, floor - 1, z * 4, 4, 1, 4);//top nooo th slabs
                        break;
                    case DOOR:
                        doWall(4, x, z, -4, 3);//base cobble
                        doWall(5, x, z, -1, 1);//wood
                        break;
                    case GLASS:
                        doWall(20, x, z, 0, 3); //glass panes
                        doWall(4, x, z, 3, 1); //top
                        doWall(4, x, z, -4, 4); //bottom
                        break;
                    case WALL: 
                        doWall(4, x, z, -4, 8);
                        break;
                }
            }
        }
    }
}

module.exports = new GenerationBoppin();
