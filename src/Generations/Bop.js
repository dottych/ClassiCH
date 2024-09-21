const fs = require('fs');

const Generation = require('../Generation');

class GenerationBop extends Generation {
    constructor() {
        super("bop");
    }

    generate() {
        if (this.x !== 256 || this.y !== 128 || this.z !== 256) return;

        if (!fs.existsSync('./bopmap.txt')) {
            console.log("bopmap.txt is missing!");
            return;
        }

        const bopMap = fs.readFileSync('./bopmap.txt').toString().match(new RegExp(`.{1,64}`, 'g'));

        for (let x = 0; x < 256; x++)
            for (let y = 0; y < 124; y++)
                for (let z = 0; z < 256; z++)
                    this.setBlock(y === 123 ? 2 : 3, x, y, z);
        
        for (let z = 0; z < 64; z++)
            for (let x = 0; x < 64; x++) {
                let bopBlock = bopMap[z][x];

                switch (bopBlock) {
                    case "1":
                        for (let bx = 0; bx < 4; bx++)
                            for (let bz = 0; bz < 4; bz++)
                                this.setBlock(3, x * 4 + bx, 123, z * 4 + bz);

                        break;

                    case "2":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(6, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "3":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(20, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "4":
                        for (let bx = 0; bx < 4; bx++)
                            for (let by = 0; by < 4; by++)
                                for (let bz = 0; bz < 4; bz++)
                                    this.setBlock(4, x * 4 + bx, 124 + by, z * 4 + bz);

                        break;

                    case "5":
                        for (let bx = 0; bx < 4; bx++)
                            for (let bz = 0; bz < 4; bz++)
                                this.setBlock(8, x * 4 + bx, 123, z * 4 + bz);

                        break;
                }
            }
            
    }
}

module.exports = new GenerationBop();