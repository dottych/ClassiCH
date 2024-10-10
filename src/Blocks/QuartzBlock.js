const CustomBlock = require('../CustomBlock');

class QuartzBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(94, false);

        this.name = "Quartz block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 90;
        this.side = 90;
        this.bottom = 91;
        
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

module.exports = QuartzBlock;