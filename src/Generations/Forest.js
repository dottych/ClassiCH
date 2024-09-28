const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationForest extends Generation {
    constructor() {
        super("Forest");
        this.author = "dottych";
    }

    generate() {
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
                this.setBlock(2, x, height, z);

                // dirt under ground block
                for (let y = height-1; y >= height-2; y--)
                    this.setBlock(3, x, y, z);

                // stone/ores
                for (let y = height-3; y >= 0; y--)
                    if (Math.floor(Math.random() * 30) === 0)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, x, y, z);
                    else
                        this.setBlock(1, x, y, z);

                // trees
                if (
                    
                    miscNoise[z + (x * this.z)] * 10 < 5 && 
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

module.exports = new GenerationForest();