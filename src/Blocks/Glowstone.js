const CustomBlock = require('../CustomBlock');

class Glowstone extends CustomBlock {
    constructor() {
        // ID, ext
        super(82, false);

        this.name = "Glowstone";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 46;
        this.side = 46;
        this.bottom = 46;
        
        this.transmitLight = true;

        this.sound = this.sounds.glass;

        this.brightness = 15;
        this.isLamp = true;
        
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Glowstone;