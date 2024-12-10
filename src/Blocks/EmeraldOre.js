const CustomBlock = require('../CustomBlock');

class EmeraldOre extends CustomBlock {
    constructor() {
        // ID, ext
        super(71, false);

        this.name = "Emerald ore";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 99;
        this.side = 99;
        this.bottom = 99;
        
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

module.exports = EmeraldOre;