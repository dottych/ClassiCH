const Generation = require('../Generation');

class GenerationWalls extends Generation {
    constructor() {
        super("walls");
    }

    generate() {
        // wall along X
        for (let x = 0; x < this.x; x++)
        for (let y = 0; y < this.y; y++) {
            this.setBlock(36, x, y, 0);
            this.setBlock(36, x, y, this.z-1);
        }

        // wall along Z
        for (let z = 0; z < this.z; z++)
            for (let y = 0; y < this.y; y++) {
                this.setBlock(36, 0, y, z);
                this.setBlock(36, this.x-1, y, z);
            }

        // floor
        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++)
                this.setBlock(36, x, 0, z);
    }
}

module.exports = new GenerationWalls();