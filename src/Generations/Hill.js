const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationHill extends Generation {
    constructor() {
        super("hill");
    }

    generate() {
        const noise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6});

        // block elevation
        const calculateHeight = (x, z) => {
            return Math.round(noise[z + (x * this.z)] * 32) + this.halfY;
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);

                for (let y = height; y >= 0; y--)
                    this.setBlock(1, x, y, z);

            }
    }
}

module.exports = new GenerationHill();