const CustomBlock = require('../CustomBlock');

class RedstoneOre extends CustomBlock {
    constructor() {
        // ID, ext
        super(69, false);

        this.name = "Redstone ore";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 97;
        this.side = 97;
        this.bottom = 97;
        
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

module.exports = RedstoneOre;