const CustomBlock = require('../CustomBlock');

class WoodenSlab extends CustomBlock {
    constructor() {
        // ID, ext
        super(107, false);

        this.name = "Wooden slab";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 4;
        this.side = 4;
        this.bottom = 4;
        
        this.transmitLight = false;

        this.sound = this.sounds.wood;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 8;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = WoodenSlab;