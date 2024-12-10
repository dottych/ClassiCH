const CustomBlock = require('../CustomBlock');

class QuartzOre extends CustomBlock {
    constructor() {
        // ID, ext
        super(93, false);

        this.name = "Quartz ore";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 103;
        this.side = 103;
        this.bottom = 103;
        
        this.transmitLight = false;

        this.sound = this.sounds.stone;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = QuartzOre;