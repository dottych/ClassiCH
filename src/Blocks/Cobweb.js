const CustomBlock = require('../CustomBlock');

class Cobweb extends CustomBlock {
    constructor() {
        // ID, ext
        super(98, false);

        this.name = "Cobweb";

        this.solidity = this.solidityModes.walkThrough;
        this.speed = 8;

        // textures
        this.top = 131;
        this.side = 131;
        this.bottom = 131;
        
        this.transmitLight = true;

        this.sound = this.sounds.none;

        this.bright = false;
        this.height = 0;
        this.drawMode = this.drawModes.leaves;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Cobweb;