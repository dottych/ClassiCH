const CustomBlock = require('../CustomBlock');

class Jukebox extends CustomBlock {
    constructor() {
        // ID, ext
        super(85, false);

        this.name = "Jukebox";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 63;
        this.side = 62;
        this.bottom = 62;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

        this.bright = false;
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Jukebox;