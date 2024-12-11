const CustomBlock = require('../CustomBlock');

class StoneSlab extends CustomBlock {
    constructor() {
        // ID, ext
        super(105, false);

        this.name = "Stone slab";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 1;
        this.side = 1;
        this.bottom = 1;
        
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

module.exports = StoneSlab;