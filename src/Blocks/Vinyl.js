const CustomBlock = require('../CustomBlock');

class Vinyl extends CustomBlock {
    constructor() {
        // ID, ext
        super(86, false);

        this.name = "Vinyl";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 93;
        this.side = 62;
        this.bottom = 62;
        
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

module.exports = Vinyl;