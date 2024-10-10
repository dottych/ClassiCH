const CustomBlock = require('../CustomBlock');

class RedstoneLampOff extends CustomBlock {
    constructor() {
        // ID, ext
        super(87, false);

        this.name = "Redstone lamp (off)";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 94;
        this.side = 94;
        this.bottom = 94;
        
        this.transmitLight = false;

        this.sound = this.sounds.glass;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = RedstoneLampOff;