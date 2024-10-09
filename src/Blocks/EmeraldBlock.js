const CustomBlock = require('../CustomBlock');

class EmeraldBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(75, false);

        this.name = "Emerald block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 115;
        this.side = 115;
        this.bottom = 115;
        
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

module.exports = EmeraldBlock;