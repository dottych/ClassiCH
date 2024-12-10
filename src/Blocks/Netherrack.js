const CustomBlock = require('../CustomBlock');

class Netherrack extends CustomBlock {
    constructor() {
        // ID, ext
        super(77, false);

        this.name = "Netherrack";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 100;
        this.side = 100;
        this.bottom = 100;
        
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

module.exports = Netherrack;