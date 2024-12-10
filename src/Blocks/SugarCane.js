const CustomBlock = require('../CustomBlock');

class SugarCane extends CustomBlock {
    constructor() {
        // ID, ext
        super(99, false);

        this.name = "Sugar cane";

        this.solidity = this.solidityModes.walkThrough;
        this.speed = 128;

        // textures
        this.top = 132;
        this.side = 132;
        this.bottom = 132;
        
        this.transmitLight = true;

        this.sound = this.sounds.grass;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 0;
        this.drawMode = this.drawModes.leaves;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = SugarCane;