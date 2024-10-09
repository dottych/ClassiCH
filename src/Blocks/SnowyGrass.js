const CustomBlock = require('../CustomBlock');

class SnowyGrass extends CustomBlock {
    constructor() {
        // ID, ext
        super(83, false);

        this.name = "Snowy grass";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 50;
        this.side = 47;
        this.bottom = 2;
        
        this.transmitLight = false;

        this.sound = this.sounds.grass;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = SnowyGrass;