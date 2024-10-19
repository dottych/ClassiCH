const CustomBlock = require('../CustomBlock');

class FarmlandDry extends CustomBlock {
    constructor() {
        // ID, ext
        super(101, false);

        this.name = "Farmland (dry)";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 89;
        this.side = 2;
        this.bottom = 2;
        
        this.transmitLight = false;

        this.sound = this.sounds.gravel;

        this.bright = false;
        this.height = 15;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = FarmlandDry;