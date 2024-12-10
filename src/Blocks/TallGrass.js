const CustomBlock = require('../CustomBlock');

class TallGrass extends CustomBlock {
    constructor() {
        // ID, ext
        super(95, false);

        this.name = "Tall grass";

        this.solidity = this.solidityModes.walkThrough;
        this.speed = 128;

        // textures
        this.top = 128;
        this.side = 128;
        this.bottom = 128;
        
        this.transmitLight = true;

        this.sound = this.sounds.grass;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 0;
        this.drawMode = this.drawModes.leaves;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = TallGrass;