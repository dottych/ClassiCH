const CustomBlock = require('../CustomBlock');

class DiamondBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(72, false);

        this.name = "Diamond block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 27;
        this.side = 43;
        this.bottom = 59;
        
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

module.exports = DiamondBlock;