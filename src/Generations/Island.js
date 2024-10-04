const perlin = require("perlin-noise");

const Generation = require("../Generation");

class GenerationIsland extends Generation {
    constructor() {
        super("Island", "tagbtr");
    }

    generate() {
        const islandNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 6, persistence: 0.35});
        const seaFloorNoise = perlin.generatePerlinNoise(this.z, this.x, {octaveCount: 5})
        const miscNoise = perlin.generatePerlinNoise(this.z, this.x);

        const calculateFallOffMap = (x, z, size) => {
            let fallOff = 1;

            fallOff /= (x * z) / (this.x * this.z) * (1 - (x / this.x)) * (1 - (z / this.z)) / size;
            if(fallOff < 0) 
                fallOff = 0.1;

            return fallOff;
        }

        const calculateHeight = (x, z) => {
            return Math.round(((islandNoise[z + (x * this.z)] - calculateFallOffMap(x, z, 0.029))) * 24) + this.halfY;
        }

        const calculateSeaFloorHeight = (x, z) => {
            return Math.round(seaFloorNoise[z + (x * this.z)] * 3) + Math.round(this.halfY * 0.6);
        }

        for (let x = 0; x < this.x; x++) 
            for (let z = 0; z < this.z; z++) {
                const height = calculateHeight(x, z);
                const seaFloorHeight = calculateSeaFloorHeight(x, z);

                const ground = (y) => {
                    if (this.getBlock(x, y + 1, z) === 0)
                        if (y > this.halfY)
                            return 2;
                        else if (y > this.halfY - 2 || y > this.halfY - 6 && miscNoise[z + (x * this.z)] > 0.3)
                            return 12;
                        else if (y < this.halfY - 10 && miscNoise[z + (x * this.z)] > 0.7)
                            return 13;
                        else
                            return 3;
                    else
                        if (this.getBlock(x, y + 1, z) === 39 || this.getBlock(x, y + 1, z) === 40)
                            return 2;
                        if (this.getBlock(x, y + 1, z) === 2 || this.getBlock(x, y + 2, z) === 2)
                            return 3;
                        if (this.getBlock(x, y + 1, z) === 18)
                            return Math.random() > 0.3 ? 39 + Math.round(Math.random()) : 0;
                        return 1;
                }

                const ore = (x, z) => {
                    if (miscNoise[z+ (x * this.z)] > 0.8)
                        return 14;
                    if (miscNoise[z + (x * this.z)] > 0.6)
                        return 15;
                    return 16;
                }

                //sea floor
                for (let y = seaFloorHeight; y >= 0; y--)
                    this.setBlock(ground(y), x, y, z);

                //land
                for (let y = height; y >= 0; y--)
                    this.setBlock(ground(y), x, y, z);

                //water
                for (let y = this.halfY; y >= 0; y--)
                    if (this.getBlock(x, y, z) === 0) this.setBlock(8, x, y, z);
                    else break;
                
                //ores
                for (let y = height - 3; y > 0; y--)
                    if (this.getBlock(x, y, z) === 1)
                        if (Math.floor(Math.random() * 15) === 0)
                            this.setBlock(ore(x, z), x, y, z);
                    
                //flowers
                if (height > this.halfY+2 && Math.round(miscNoise[z + (x * this.z)] * 2) === 2)
                    if (Math.floor(Math.random() * 4) === 0)
                       this.setBlock(Math.round(Math.random()) + 37, x, height+1, z);

                //trees
                if (
                    miscNoise[z + (x * this.z)] * 10 < 2 && 
                    Math.floor(Math.random() * 2) === 0 &&
                    height > this.halfY &&
                    x > 1 && x < this.x-2 &&
                    z > 1 && z < this.z-2 &&
                    !this.treeNearby(x, height + 2, z)
                    
                ) {
                    this.setBlock(3, x, height, z);
                    this.tree(x, height + 1, z);
                }
            }
    }
}

module.exports = new GenerationIsland();