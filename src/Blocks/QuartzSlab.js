const CustomBlock = require('../CustomBlock');

class QuartzSlab extends CustomBlock {
    constructor() {
        // ID, ext
        super(108, false);

        this.name = "Quartz slab";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 90;
        this.side = 90;
        this.bottom = 91;
        
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

module.exports = QuartzSlab;