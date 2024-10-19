const CustomBlock = require('../CustomBlock');

class Clay extends CustomBlock {
    constructor() {
        // ID, ext
        super(79, false);

        this.name = "Clay";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 102;
        this.side = 102;
        this.bottom = 102;
        
        this.transmitLight = false;

        this.sound = this.sounds.sand;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Clay;