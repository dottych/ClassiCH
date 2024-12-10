const CustomBlock = require('../CustomBlock');

class FarmlandWet extends CustomBlock {
    constructor() {
        // ID, ext
        super(100, false);

        this.name = "Farmland (wet)";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 88;
        this.side = 2;
        this.bottom = 2;
        
        this.transmitLight = false;

        this.sound = this.sounds.gravel;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 15;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = FarmlandWet;