const CustomBlock = require('../CustomBlock');

class DeadBush extends CustomBlock {
    constructor() {
        // ID, ext
        super(97, false);

        this.name = "Dead bush";

        this.solidity = this.solidityModes.walkThrough;
        this.speed = 128;

        // textures
        this.top = 130;
        this.side = 130;
        this.bottom = 130;
        
        this.transmitLight = true;

        this.sound = this.sounds.grass;

        this.bright = false;
        this.height = 0;
        this.drawMode = this.drawModes.leaves;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = DeadBush;