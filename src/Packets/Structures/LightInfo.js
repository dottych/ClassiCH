const Structure = require('../Structure');

class StructureLightInfo extends Structure {
    constructor(brightness, isLamp = false, isStructure = false) {
        super();
        
        this.brightness = brightness;
        this.isLamp = isLamp;
        this.isStructure = isStructure;
    }

    toBits() {
        let bits = "";
        bits += this.isStructure ? "1" : "0";
        bits += this.isLamp ? "1" : "0";
        bits += "00"; // unused
        bits += this.brightness.toString(2).padStart(4, "0");
        return +`0b${bits}`;
    }
}

module.exports = StructureLightInfo;