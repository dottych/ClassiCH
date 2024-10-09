const CustomBlock = require('../CustomBlock');

class Pumpkin extends CustomBlock {
    constructor() {
        // ID, ext
        super(80, false);

        this.name = "Pumpkin";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 44;
        this.side = 60;
        this.bottom = 44;
        
        this.transmitLight = false;

        this.sound = this.sounds.wood;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Pumpkin;