const CustomBlock = require('../CustomBlock');

class LapisLazuliBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(74, false);

        this.name = "Lapis lazuli block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 114;
        this.side = 114;
        this.bottom = 114;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = LapisLazuliBlock;