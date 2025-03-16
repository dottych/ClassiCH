const ServerPacket = require('../../ServerPacket');
const LightInfoStructure = require('../../structures/LightInfo');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class DefineBlockPacket extends ServerPacket {
    constructor(
        clients,
        id,
        name,
        solidity,
        speed,
        top,
        side,
        bottom,
        transmitLight,
        sound,
        brightness,
        isLamp,
        height,
        drawMode,
        fogDensity,
        fogR,
        fogG,
        fogB
    ) {
        super(clients, lists.serverPackets.ext.defineBlock);

        this.id = id;
        this.name = name;
        this.solidity = solidity;
        this.speed = speed;
        this.top = top;
        this.side = side;
        this.bottom = bottom;
        this.transmitLight = transmitLight;
        this.sound = sound;
        this.brightness = brightness;
        this.isLamp = isLamp;
        this.height = height;
        this.drawMode = drawMode;
        this.fogDensity = fogDensity;
        this.fogR = fogR;
        this.fogG = fogG;
        this.fogB = fogB;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.id,
            ...utils.string(this.name),
            this.solidity,
            this.speed,
            this.top,
            this.side,
            this.bottom,
            this.transmitLight ? 1 : 0,
            this.sound,
            new LightInfoStructure(this.brightness, this.isLamp, true).toBits(),
            this.height,
            this.drawMode,
            this.fogDensity,
            this.fogR,
            this.fogG,
            this.fogB

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = DefineBlockPacket;