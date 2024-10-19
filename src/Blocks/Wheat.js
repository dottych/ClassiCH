const CustomBlock = require('../CustomBlock');

class Wheat extends CustomBlock {
    constructor() {
        // ID, ext
        super(96, false);

        this.name = "Wheat";

        this.solidity = this.solidityModes.walkThrough;
        this.speed = 128;

        // textures
        this.top = 129;
        this.side = 129;
        this.bottom = 129;
        
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

module.exports = Wheat;