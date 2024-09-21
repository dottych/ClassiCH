const Generation = require('../Generation');

class GenerationFlat extends Generation {
    constructor() {
        super("flat");
    }

    generate() {
        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                // grass
                this.setBlock(2, x, this.halfY, z);

                // dirt
                for (let y = this.halfY-1; y >= this.halfY-3; y--)
                    this.setBlock(3, x, y, z);

                // stone
                for (let y = this.halfY-4; y >= 0; y--) {
                    // random ores
                    if (Math.floor(Math.random() * 40) === 39)
                        this.setBlock(Math.floor(Math.random() * 3) + 14, x, y, z);
                    else
                        this.setBlock(1, x, y, z);

                }
                    
            }
    }
}

module.exports = new GenerationFlat();