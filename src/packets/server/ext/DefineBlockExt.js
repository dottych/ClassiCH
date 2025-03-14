const ServerPacket = require('../../ServerPacket');
const LightInfoStructure = require('../../Structures/LightInfo');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

// this does not support sprites - use non ext instead
class DefineBlockExtPacket extends ServerPacket {
    constructor(
        clients,
        id,
        name,
        solidity,
        speed,
        top,
        left,
        right,
        front,
        back,
        bottom,
        transmitLight,
        sound,
        brightness,
        isLamp,
        minX,
        minY,
        minZ,
        maxX,
        maxY,
        maxZ,
        drawMode,
        fogDensity,
        fogR,
        fogG,
        fogB
    ) {
        super(clients, lists.serverPackets.ext.defineBlockExt);

        this.id = id;
        this.name = name;
        this.solidity = solidity;
        this.speed = speed;
        this.top = top;
        this.left = left;
        this.right = right;
        this.front = front;
        this.back = back;
        this.bottom = bottom;
        this.transmitLight = transmitLight;
        this.sound = sound;
        this.brightness = brightness;
        this.isLamp = isLamp;
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
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
            this.left,
            this.right,
            this.front,
            this.back,
            this.bottom,
            this.transmitLight ? 1 : 0,
            this.sound,
            new LightInfoStructure(this.brightness, this.isLamp, true).toBits(),
            this.minX,
            this.minY,
            this.minZ,
            this.maxX,
            this.maxY,
            this.maxZ,
            this.drawMode,
            this.fogDensity,
            this.fogR,
            this.fogG,
            this.fogB

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = DefineBlockExtPacket;