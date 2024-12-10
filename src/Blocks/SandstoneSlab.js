const CustomBlock = require('../CustomBlock');

class SandstoneSlab extends CustomBlock {
    constructor() {
        // ID, ext
        super(91, false);

        this.name = "Sandstone slab";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 25;
        this.side = 41;
        this.bottom = 57;
        
        this.transmitLight = false;

        this.sound = this.sounds.stone;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 8;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = SandstoneSlab;