const CustomBlock = require('../CustomBlock');

class CobblestoneSlab extends CustomBlock {
    constructor() {
        // ID, ext
        super(106, false);

        this.name = "Cobblestone slab";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 16;
        this.side = 16;
        this.bottom = 16;
        
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

module.exports = CobblestoneSlab;