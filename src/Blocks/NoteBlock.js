const CustomBlock = require('../CustomBlock');

class NoteBlock extends CustomBlock {
    constructor() {
        // ID, ext
        super(84, false);

        this.name = "Note block";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 62;
        this.side = 62;
        this.bottom = 62;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

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

module.exports = NoteBlock;