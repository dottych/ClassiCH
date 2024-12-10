const CustomBlock = require('../CustomBlock');

class SoulSand extends CustomBlock {
    constructor() {
        // ID, ext
        super(78, false);

        this.name = "Soul sand";

        this.solidity = this.solidityModes.solid;
        this.speed = 64;

        // textures
        this.top = 101;
        this.side = 101;
        this.bottom = 101;
        
        this.transmitLight = false;

        this.sound = this.sounds.sand;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 15;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = SoulSand;