const CustomBlock = require('../CustomBlock');

class LapisLazuliOre extends CustomBlock {
    constructor() {
        // ID, ext
        super(70, false);

        this.name = "Lapis lazuli ore";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 98;
        this.side = 98;
        this.bottom = 98;
        
        this.transmitLight = false;

        this.sound = this.sounds.stone;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = LapisLazuliOre;