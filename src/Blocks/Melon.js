const CustomBlock = require('../CustomBlock');

class Melon extends CustomBlock {
    constructor() {
        // ID, ext
        super(81, false);

        this.name = "Melon";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 45;
        this.side = 61;
        this.bottom = 61;
        
        this.transmitLight = false;

        this.sound = this.sounds.wood;

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

module.exports = Melon;