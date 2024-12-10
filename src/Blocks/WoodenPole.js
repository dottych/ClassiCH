const CustomBlock = require('../CustomBlock');

class Pole extends CustomBlock {
    constructor() {
        // ID, ext
        super(104, true);

        this.name = "Wooden pole";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 4;
        this.left = 4;
        this.right = 4;
        this.front = 4;
        this.back = 4;
        this.bottom = 4;
        
        this.transmitLight = false;

        this.sound = this.sounds.wood;

        this.brightness = 0;
        this.isLamp = false;

        this.minX = 7;
        this.minY = 0;
        this.minZ = 7;
        this.maxX = 9;
        this.maxY = 16;
        this.maxZ = 9;

        this.drawMode = this.drawModes.opaque;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = Pole;