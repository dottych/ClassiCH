const CustomBlock = require('../CustomBlock');

class SnowBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(92, false);

        this.name = "Snow block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 50;
        this.side = 50;
        this.bottom = 50;
        
        this.transmitLight = false;

        this.sound = this.sounds.snow;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = SnowBlock;