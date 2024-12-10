const CustomBlock = require('../CustomBlock');

class DiamondOre extends CustomBlock {
    constructor() {
        // ID, ext
        super(68, false);

        this.name = "Diamond ore";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 96;
        this.side = 96;
        this.bottom = 96;
        
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

module.exports = DiamondOre;