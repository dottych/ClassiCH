const CustomBlock = require('../CustomBlock');

class RedstoneBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(73, false);

        this.name = "Redstone block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 113;
        this.side = 113;
        this.bottom = 113;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

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

module.exports = RedstoneBlock;