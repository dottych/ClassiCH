const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationLand extends Generation {
    constructor() {
        super("Land", "dottych");
    }

    generate() {
        const noise = perlin.generatePerlinNoise(this.z, this.x);
        const multiNoise = perlin.generatePerlinNoise(this.z, this.x);
        const miscNoise = perlin.generatePerlinNoise(this.z, this.x);
        const smoothNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});
        const hillNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 7});

        // block elevation
        const calculateHeight = (x, z) => {
            return Math.round(noise[z + (x * this.z)] * 4) +
                this.halfY - 18 +
                (multiNoise[z + (x * this.z)] * 2 > 1.25 ? 0 : 1) *
                Math.round(smoothNoise[z + (x * this.z)] * 16) +
                Math.round(miscNoise[z + (x * this.z)] * 3) +
                Math.round(hillNoise[z + (x * this.z)] * 32);
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);

                const ground = () => {
                    if (height < this.halfY)
                        if (Math.round(miscNoise[z + (x * this.z)]) === 1)
                            return 12;
                        else
                            if (miscNoise[z + (x * this.z)] < 0.25)
                                return 13;
                            else
                                return 3;

                    else
                        if (Math.round(miscNoise[z + (x * this.z)]) === 1 && height < this.halfY+3)
                            return 12;
                        else
                            return 2;

                }

                // grass (or dirt/sand underwater)
                this.setBlock(ground(), x, height, z);

                // dirt/sand under ground block
                for (let y = height-1; y >= height-2; y--)
                    this.setBlock(ground() === 12 ? 12 : 3, x, y, z);

                // stone/ores
                for (let y = height-3; y >= 0; y--)
                    if (Math.floor(Math.random() * 30) === 0)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, x, y, z);
                    else
                        this.setBlock(1, x, y, z);

                // water
                for (let y = this.halfY; y >= 0; y--)
                    if (this.getBlock(x, y, z) === 0) this.setBlock(8, x, y, z);
                    else break;

                // flowers
                if (height > this.halfY+2 && Math.round(miscNoise[z + (x * this.z)] * 2) === 2)
                    if (Math.floor(Math.random() * 4) === 0)
                        this.setBlock(Math.round(Math.random()) + 37, x, height+1, z);

                // trees
                if (
                    
                    miscNoise[z + (x * this.z)] * 10 < 2 && 
                    Math.floor(Math.random() * 2) === 0 &&
                    height > this.halfY &&
                    x > 1 && x < this.x-2 &&
                    z > 1 && z < this.z-2 &&
                    !this.treeNearby(x, height+2, z)
                    
                ) {
                    this.setBlock(3, x, height, z);
                    this.tree(x, height+1, z);
                }
            }
        
    }
}

module.exports = new GenerationLand();