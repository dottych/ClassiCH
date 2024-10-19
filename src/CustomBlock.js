class CustomBlock {
    constructor(id, ext) {
        this.id = id;
        this.ext = ext;

        this.solidityModes = {
            walkThrough: 0,
            swimThrough: 1,
            solid: 2,
            partiallySlippery: 3,
            slippery: 4,
            water: 5,
            lava: 6,
            rope: 7
        }

        this.sounds = {
            none: 0,
            wood: 1,
            gravel: 2,
            grass: 3,
            stone: 4,
            metal: 5,
            glass: 6,
            wool: 7,
            sand: 8,
            snow: 9
        }

        this.drawModes = {
            opaque: 0,
            glass: 1,
            leaves: 2,
            water: 3,
            air: 4
        }
    }
}

module.exports = CustomBlock;