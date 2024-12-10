const CustomBlock = require('../CustomBlock');

class Pole extends CustomBlock {
    constructor() {
        // ID, ext
        super(103, true);

        this.name = "Pole";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 26;
        this.left = 42;
        this.right = 42;
        this.front = 42;
        this.back = 42;
        this.bottom = 58;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

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