const CustomBlock = require('../CustomBlock');

class SeaLantern extends CustomBlock {
    constructor() {
        // ID, ext
        super(102, false);

        this.name = "Sea lantern";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 117;
        this.side = 117;
        this.bottom = 117;
        
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

module.exports = SeaLantern;