const CustomBlock = require('../CustomBlock');

class RedstoneLampOn extends CustomBlock {
    constructor() {
        // ID, ext
        super(88, false);

        this.name = "Redstone lamp (on)";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 95;
        this.side = 95;
        this.bottom = 95;
        
        this.transmitLight = true;

        this.sound = this.sounds.glass;

        this.brightness = 15;
        this.isLamp = false; // makes this specific lamp look more yellow with lava lighting
        
        this.height = 16;
        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = RedstoneLampOn;