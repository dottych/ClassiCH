const CustomBlock = require('../CustomBlock');

class MonsterSpawner extends CustomBlock {
    constructor() {
        // ID, ext
        super(89, false);

        this.name = "Monster spawner";

        this.solidity = this.solidityModes.solid;
        this.speed = 128;

        // textures
        this.top = 116;
        this.side = 116;
        this.bottom = 116;
        
        this.transmitLight = false;

        this.sound = this.sounds.metal;

        this.brightness = 0;
        this.isLamp = false;
        
        this.height = 16;
        this.drawMode = this.drawModes.leaves;

        this.fogDensity = 0;
        this.fogR = 255;
        this.fogG = 255;
        this.fogB = 255;
    }
}

module.exports = MonsterSpawner;