const Generation = require('../Generation');

class GenerationSkygrid extends Generation {
    constructor() {
        super("Skygrid", "gnawmon");
    }

    generate() {
        for (let x = 0; x < this.x; x++)
            for (let y = 0; y < this.y; y++)
                for (let z = 0; z < this.z; z++)
                    if (!(x % 4) && !(z % 4) && !(y % 4))
                        this.setBlock(Math.floor(Math.random() * 50), x, y, z);

    }


}

module.exports = new GenerationSkygrid();