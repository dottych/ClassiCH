const Generation = require('../Generation');

class GenerationParkour extends Generation {
    constructor() {
        super("Parkour", "gnawmon");
    }

    generate() {
        const house = (height, houseX, houseZ) => {
            for (let x = 0; x < this.x; x++)
                for (let z = 0; z < this.z; z++) {
                    if ((x >= houseX && x <= houseX + 9) && (z >= houseZ && z <= houseZ + 12)) {
                        this.setBlock(1, x, this.halfY + 1, z); //first floor
                        this.setBlock(1, x, this.halfY + 5, z); //second floor
                        this.setBlock(1, x, this.halfY + height, z); // roof

                        for (let y = this.halfY + 1; y < this.y; y++) {
                            if ((x == houseX || x == houseX + 9 || z == houseZ || z == houseZ + 12) //edges of the house
                                && y < this.halfY + height // house height
                            ) {
                                this.setBlock(1, x, y, z); // put walls
                            }

                            //remove corners
                            if (((x == houseX && z == houseZ) || (x == houseX + 9 && z == houseZ) || (x == houseX + 9 && z == houseZ + 12) || (x == houseX && z == houseZ + 12)) //corners
                                && y != this.halfY + 1 && y != this.halfY + height) {
                                this.setBlock(0, x, y, z);
                            }
                        }
                    }

                }

            //first floor parkour
            for (let i = 2; i <= 7; i++) {
                this.setBlock(0, houseX + i, this.halfY + 1, houseZ + 6)
                this.setBlock(0, houseX + i, this.halfY, houseZ + 6)
            }
            //second floor parkour
            for (let i = 1; i <= 8; i++) {
                this.setBlock(0, houseX + i, this.halfY + 5, houseZ + 6)
            }

            //door stairs
            this.setBlock(44, houseX + 10, this.halfY + 1, houseZ + 6);

            //door hole
            this.setBlock(0, houseX + 9, this.halfY + 2, houseZ + 6);
            this.setBlock(0, houseX + 9, this.halfY + 3, houseZ + 6);

            //stairs
            this.setBlock(44, houseX + 7, this.halfY + 2, houseZ + 1);
            this.setBlock(43, houseX + 6, this.halfY + 2, houseZ + 1);
            this.setBlock(44, houseX + 5, this.halfY + 3, houseZ + 1);
            this.setBlock(43, houseX + 4, this.halfY + 3, houseZ + 1);
            this.setBlock(44, houseX + 3, this.halfY + 4, houseZ + 1);
            this.setBlock(43, houseX + 2, this.halfY + 4, houseZ + 1);
            this.setBlock(44, houseX + 1, this.halfY + 5, houseZ + 1);


            for (let i = houseX + 2; i < houseX + 7; i++)
                this.setBlock(0, i, this.halfY + 5, houseZ + 1);

            //furnaces
            this.setBlock(46, houseX + 6, this.halfY + 2, houseZ + 11);
            this.setBlock(44, houseX + 6, this.halfY + 3, houseZ + 11);

            this.setBlock(46, houseX + 3, this.halfY + 2, houseZ + 11);
            this.setBlock(44, houseX + 3, this.halfY + 3, houseZ + 11);

            //couch
            this.setBlock(44, houseX + 1, this.halfY + 6, houseZ + 9);
            this.setBlock(44, houseX + 1, this.halfY + 6, houseZ + 10);
            this.setBlock(44, houseX + 1, this.halfY + 6, houseZ + 11);
            this.setBlock(44, houseX + 2, this.halfY + 6, houseZ + 11);

            //bed
            this.setBlock(25, houseX + 7, this.halfY + 6, houseZ + 10);
            this.setBlock(36, houseX + 7, this.halfY + 6, houseZ + 11);

            this.setBlock(47, houseX + 8, this.halfY + 6, houseZ + 11);

            //the log
            this.setBlock(17, houseX + 12, this.halfY + 1, houseZ + 4);
        }

        for (let x = 0; x < this.x; x++)
            for (let z = 0; z < this.z; z++) {
                if (!(x % 2) && !(z % 2))
                    this.setBlock(2, x, this.halfY, z); //grass

                this.setBlock(10, x, 1, z) //lava
            }

        for (let i = 0; i < 6; i++)
            house(10, Math.floor(Math.random() * 240), Math.floor(Math.random() * 240));

    }


}

module.exports = new GenerationParkour();