const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationOcean extends Generation {
    constructor() {
        super("Ocean", "marioood");
    }

    generate() {
        const floor = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
        const step = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const flat = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const steep = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const gravel = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 4});
        const coral = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 7});
        const temp = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 7});
        //how large the spawn island is
        const spawnSize = 32;
        //maximum distance a structure can be from the world border
        const structDist = 8;

        const rand = (size) => {
            return Math.floor(Math.random() * size);
        }

        const calculateHeight = (x, z) => {
            //idk cool shit ig
            let base = (floor[z + x * this.z] * 8);
            let plateau = Math.round(step[z + x * this.z] * 4) * (steep[z + x * this.z] * 12);
            let flatness = flat[z + x * this.z];
            //a full second was lost from just distance calculations on a 1024x128x1024 map
            let xD = this.x / 2 - x;
            let zD = this.z / 2 - z;
            let dist = Math.sqrt(xD * xD + zD * zD);
            let spawn = dist < spawnSize ? Math.min((spawnSize - dist) / spawnSize, 0.6) * (this.y * 0.75) : 0;
            let falloff = Math.max(Math.min(dist / spawnSize, 1), 0.3);
            return (base * flatness) + ((plateau * falloff) + this.halfY / 8) + spawn;
        }

        const valid = (x, z) => {
            //make sure stuff isnt outta bounds
            return !(x < structDist || z < structDist || x > this.x - structDist || z > this.z - structDist);
        }
        //the insanity smp. its hardcore minecraft, but everyone has unique super powers. and im inviting YOU the viewer to join. share a video with this sound if you want to join this amazing community.
        //the ground
        for(let z = 0; z < this.z; z++) {
            for(let x = 0; x < this.x; x++) {
                let height = calculateHeight(x, z);
                let block;
                for(let y = 0; y <= Math.max(this.halfY, height); y++) {
                    if(y == 0) {
                        block = 11; //lava
                    } else if(y < height) {
                        if(y < height - 1 - (gravel[x + z * this.x] * 4)){
                            //ores, less common as height increases
                            if(rand(Math.max(y, 16)) == 0) {
                                if(rand(8) == 0) {
                                    block = 14; //gold
                                } else {
                                    block = 15 + rand(2); //iron / coal
                                }
                            } else {
                                block = 1; //stone
                            }
                        } else {
                            if(y < this.halfY + 2 + gravel[z + x * this.z] * 2) {
                                if(gravel[z + x * this.z] + flat[z + x * this.z] < 1 || height > this.halfY - 4) {
                                    block = 12; //sand
                                } else {
                                    block = 13; //gravel
                                }
                            } else {
                                if(y > height - 1) {
                                    block = 2; //grass
                                } else {
                                    block = 3; //dirt
                                }
                            }
                        }
                    } else {
                        block = 9; //water
                    }
                    this.setBlock(block, x, y, z);
                }
            }
        }
        //structure stuff
        const setBranchCoral = (x, y, z, col) => {
            let tiny = rand(2);
            let height = rand(4);
            height = height * height + 1 + rand(2);
            
            for(let i = 0; i < height; i++) {
                this.setBlock(col, x, y + i, z);
            }
            y += height - 1;
            
            for(let sX = -1; sX <= 1; sX++) {
                for(let sZ = -1; sZ <= 1; sZ++) {
                    if(Math.random() > 0.5) continue;
                    let yOff = rand(height);
                    let armLen = Math.max((rand(6) - tiny), 2);
                    let armHeight = Math.abs((rand(6) - tiny));
                    //vertical arm
                    for(let i = 0; i < armHeight; i++) {
                        this.setBlock(col, x + sX * armLen, y + i - yOff, z + sZ * armLen);
                    }
                    
                    if(sX == 0 && sZ == 0) continue;
                    //horizontal arm
                    for(let s = 1; s < armLen; s++) {
                        this.setBlock(col, x + sX * s, y - yOff, z + sZ * s);
                    }
                }
            }
        }

        const setStarfish = (x, y, z, col) => {
            let armLen = 3 + rand(2);
            //offset for which arms should not be generated
            let rot = rand(8);
            //could be done mathematically.... but that sounds haaaaaard!!!
            const offs = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
            //ground check, goes clockwise
            for(let i = 0; i < 8; i++) {
                //skip arms
                if(i == (0 + rot) % 7) continue;
                if(i == (2 + rot) % 7) continue;
                if(i == (5 + rot) % 7) continue;
                let prevY = y;
                for(let a = 1; a < armLen; a++) {
                    let xA = x + offs[i][0] * a;
                    let zA = z + offs[i][1] * a;
                    //check if the difference between the center height and arm end heights is too much
                    if(Math.abs(Math.floor(calculateHeight(xA, zA) - prevY)) > 1) return;
                    prevY = calculateHeight(xA, zA);
                }
            }
            //center
            this.setBlock(col, x, y + 1, z);
            //arms, goes clockwise
            for(let i = 0; i < 8; i++) {
                //skip arms so its not an octopus
                if(i == (0 + rot) % 7) continue;
                if(i == (2 + rot) % 7) continue;
                if(i == (5 + rot) % 7) continue;
                
                for(let a = 1; a < armLen; a++) {
                    let xA = x + offs[i][0] * a;
                    let zA = z + offs[i][1] * a;
                    this.setBlock(col, xA, Math.floor(calculateHeight(xA, zA)) + 1, zA);
                }
            }
        }
        //brian look out!!
        const setBrainCoral = (x0, y0, z0, col) => {
            let radius = rand(4) + 2;
            let height = Math.max(radius - rand(3), 2);
            //done so spheres arent circumcisezed
            let yNorm = radius / height;
            
            for(let y = -height; y < height; y++) {
                for(let x = -radius; x < radius; x++) {
                    for(let z = -radius; z < radius; z++) {
                        //replace water
                        if(this.getBlock(x + x0, y + y0, z + z0) == 9) {
                            if(Math.random() > 0.1) {
                                let dist = Math.sqrt(x * x + (y * yNorm) * (y * yNorm) + z * z);
                                if(dist < radius && dist > radius - (0.5 + yNorm)) {
                                    this.setBlock(col, x + x0, y + y0, z + z0);
                                }
                            }
                        }
                    }
                }
            }
        }

        const setTubeCoral = (x0, y0, z0, col, fill) => {
            y0 -= 2;
            let r = rand(2) + 1;
            let height = rand(8) + 2 + rand(r);
            //even or odd
            //DOO WATER CHECKS??? MAYBE??? TODOO ??
            if(rand(2)) {
                for(let x = -r; x < r; x++) {
                    for(let y = 0; y < height; y++) {
                        this.setBlock(col, x + x0, y + y0, z0 + r);
                        this.setBlock(col, x + x0, y + y0, z0 - r - 1);
                    }
                }
                
                for(let z = -r; z < r; z++) {
                    for(let y = 0; y < height; y++) {
                        this.setBlock(col, x0 + r, y + y0, z + z0);
                        this.setBlock(col, x0 - r - 1, y + y0, z + z0);
                    }
                }
                
                for(let z = -r; z < r; z++) {
                    for(let x = -r; x < r; x++) {
                        this.setBlock(fill, x0 + x, y0 + height - 2, z + z0);
                    }
                }
            } else {
                for(let x = -r + 1; x < r; x++) {
                    for(let y = 0; y < height; y++) {
                        this.setBlock(col, x + x0, y + y0, z0 + r);
                        this.setBlock(col, x + x0, y + y0, z0 - r);
                    }
                }
                
                for(let z = -r + 1; z < r; z++) {
                    for(let y = 0; y < height; y++) {
                        this.setBlock(col, x0 + r, y + y0, z + z0);
                        this.setBlock(col, x0 - r, y + y0, z + z0);
                    }
                }
                
                for(let z = -r + 1; z < r; z++) {
                    for(let x = -r + 1; x < r; x++) {
                        this.setBlock(fill, x0 + x, y0 + height - 2, z + z0);
                    }
                }
            }
        }

        const setPlateCoral = (x0, y0, z0, col, stem) => {
            let segs = rand(3) + 2;
            let r = rand(3) + 1;
            for(let s = 0; s < segs; s++) {
                if(this.getBlock(x0, y0 + s * 2, z0)) {
                    this.setBlock(stem, x0, y0 + s * 2, z0);
                }
                for(let x = -r; x < r + 1; x++) {
                    for(let z = -r; z < r + 1; z++) {
                        //skip corners
                        if(x == r && z == r) continue;
                        if(x == -r && z == r) continue;
                        if(x == r && z == -r) continue;
                        if(x == -r && z == -r) continue;
                        //replace water
                        if(this.getBlock(x0 + x, y0 + s * 2 + 1, z + z0) == 9) {
                            this.setBlock(col, x0 + x, y0 + s * 2 + 1, z + z0);
                        }
                    }
                }
                //random offset after each segment
                x0 += rand(3) - 1;
                z0 += rand(3) - 1;
                ///de crease segment radius
                if(Math.random() > 0.25) {
                    r--;
                    if(Math.random() > 0.85) r += rand(2) + 1;
                }
                //stop ifft ooo smallll
                if(r < 1) return;
                if(r < 2 && Math.random > 0.5) return;
            }
        }

        const setRock = (x0, y0, z0, radius) => {
            for(let y = -radius; y < radius; y++) {
                for(let x = -radius; x < radius; x++) {
                    for(let z = -radius; z < radius; z++) {
                        if(Math.sqrt(x * x + y * y + z * z) < radius) {
                            //cobblestone and mossy xcooblleee
                            this.setBlock((rand(2) ? 4 : 48), x + x0, y + y0, z + z0);
                        }
                    }
                }
            }
        }

        const setRocks = (x, z) => {
            let amount = rand(8) + 1;
            for(let i = 0; i < amount; i++) {
                let y = Math.round(calculateHeight(x, z));
                let radius = rand(2) + 2;
                if(Math.random() > 0.8 && amount > 3) radius += rand(3);
                setRock(x, y, z, radius);
                x += rand(radius * 4 + 4) - radius * 2 - 2;
                z += rand(radius * 4 + 4) - radius * 2 - 2;
                //stop if too close to edge - getting the height out of bounds crashes!
                if(!valid(x, z)) return;
            }
        }
        //wifey
        const setTree = (x0, y0, z0) => {
            let height = 8 + rand(4);
            let bendPoint = rand(height - 4) + 3;
            for(let y = 0; y < height; y++) {
                this.setBlock(17, x0, y0 + y, z0) //wood
                
                if(y == bendPoint) {
                    if(rand(2)) x0 += rand(3) - 1;
                    if(rand(2)) z0 += rand(3) - 1;
                }
            }
            y0 += height;
            //center
            this.setBlock(18, x0, y0, z0);
            //cross
            this.setBlock(18, x0, y0 + 1, z0);
            this.setBlock(18, x0 + 1, y0 + 1, z0);
            this.setBlock(18, x0, y0 + 1, z0 + 1);
            this.setBlock(18, x0 - 1, y0 + 1, z0);
            this.setBlock(18, x0, y0 + 1, z0 - 1);
            //you've seen this before....
            for(let x = -1; x <= 1; x++) {
                for(let z = -1; z <= 1; z++) {
                    //cant have a leaf that goes from like... the center dude
                    if(x == 0 && z == 0) continue;
                    
                    let y = 0;
                    let armLen = 2 + rand(3);
                    
                    for(let a = 1; a <= armLen; a++) {
                        this.setBlock(18, x0 + a * x, y0 + y, z0 + a * z) //leaves
                        //add a slight droop
                        if(Math.random() > 0.75) y--;
                    }
                }
            }
            //coconuts
            for(let x = -1; x <= 1; x++) {
                for(let z = -1; z <= 1; z++) {
                    //skip center
                    if(x == 0 && z == 0) continue;
                    if(Math.random() > 0.75) this.setBlock(3, x0 + x, y0 - 1, z0 + z); //dirt
                }
            }
        }

        let colorsWarm = [21, 22, 23, 33];
        let colorsCool = [26, 27, 29, 30];
        let colorsDead = [1, 4, 1, 4];
        if(rand(8) == 0) {
            if(rand(2)) {
                colorsWarm = colorsDead;
            }
            if(rand(2)) {
                colorsCool = colorsDead;
            }
        }

        for(let i = 0; i < (this.x + this.z) * 0.8; i++) {
            //make sure stuff sint tooo far away
            let x = Math.max(Math.min(rand(this.x), this.x - structDist), structDist);
            let z = Math.max(Math.min(rand(this.z), this.z - structDist), structDist);
            let height = Math.round(calculateHeight(x, z));
            if(height < 40) {
                let biota = coral[z + x * this.z];
                let warm = temp[z + x * this.z] > 0.5;
                if(rand(32) == 0) warm = !warm;
                
                if(biota > 0.55) {
                    if(warm) {
                        if(rand(2)) {
                            setBranchCoral(x, height, z, colorsWarm[rand(4)]);
                        } else {
                            setPlateCoral(x, height, z, colorsWarm[rand(4)], colorsWarm[rand(4)]);
                        }
                    } else {
                        if(rand(2)) {
                            setBrainCoral(x, height, z, colorsCool[rand(4)]);
                        } else {
                            setTubeCoral(x, height, z, colorsCool[rand(4)], colorsCool[rand(4)]);
                        }
                    }
                } else if(rand(32) == 0) {
                    if(warm) {
                        setStarfish(x, height, z, colorsWarm[0]);
                    } else {
                        setStarfish(x, height, z, colorsCool[2]);
                    }
                } else if(rand(32) == 0) {
                    setRocks(x, z);
                }
            }
        }
        //circular arrangement for trees
        let treeCount = rand(4) + 1;
        for(let i = 0; i < treeCount; i++) {
            let wayRound = Math.random() * 360;
            let radius = (spawnSize / 2) - 4 + rand(4);
            let x = Math.round(Math.sin(wayRound) * radius + this.x / 2);
            let z = Math.round(Math.cos(wayRound) * radius + this.z / 2);
            let height = Math.round(calculateHeight(x, z));
            setTree(x, height, z);
        }
    }
}

module.exports = new GenerationOcean();