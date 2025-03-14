const zlib = require('zlib');

const Behaviour = require('../../Behaviour');

const ServerInitPacket = require('../../server/Init');
const ServerChunkPacket = require('../../server/Chunk');
const ServerFinalPacket = require('../../server/Final');
const ServerDefineBlockPacket = require('../../server/ext/DefineBlock');
const ServerDefineBlockExtPacket = require('../../server/ext/DefineBlockExt');
const ServerSetMapEnvUrlPacket = require('../../server/ext/SetMapEnvUrl');
const ServerSetMapEnvPropertyPacket = require('../../server/ext/SetMapEnvProperty');
const ServerEnvSetColorPacket = require('../../server/ext/EnvSetColor');
const ServerEnvSetWeatherTypePacket = require('../../server/ext/EnvSetWeatherType');
const ServerLightingModePacket = require('../../server/ext/LightingMode');

const world = require('../../../World');
const lists = require('../../../Lists');
const config = require('../../../Config');

class BehaviourIdentificationWorld extends Behaviour {
    constructor(client) {
        super();

        this.client = client;

        this.successful = this.execute();
    }

    execute() {
        // world init packet
        new ServerInitPacket([this.client]);

        // compressed world data
        const compressedWorld = zlib.gzipSync(world.buffer);

        // compressed world data chunk loop
        for (let i = 0; i < compressedWorld.length; i += 1024) {
            let sliceBuffer = Buffer.alloc(1024, 0x00);
            let slicedChunk = compressedWorld.subarray(i, Math.min(i + 1024, compressedWorld.length));

            // this loop can be done better?
            for (let j = 0; j < slicedChunk.length; j++)
                sliceBuffer[j] = slicedChunk[j];

            let progress = i == 0 ? 0 : Math.ceil(i / compressedWorld.length * 100);

            // send compressed world data chunk with progress to client
            new ServerChunkPacket(

                [this.client],
                sliceBuffer,
                progress

            );
        }

        // send all custom blocks
        for (let customBlock of Object.values(lists.customBlocks))
            if (!customBlock.ext)
                new ServerDefineBlockPacket(

                    [this.client],
                    customBlock.id,
                    customBlock.name,
                    customBlock.solidity,
                    customBlock.speed,
                    customBlock.top,
                    customBlock.side,
                    customBlock.bottom,
                    customBlock.transmitLight,
                    customBlock.sound,
                    customBlock.brightness,
                    customBlock.isLamp,
                    customBlock.height,
                    customBlock.drawMode,
                    customBlock.fogDensity,
                    customBlock.fogR,
                    customBlock.fogG,
                    customBlock.fogB

                );
            else
                new ServerDefineBlockExtPacket(

                    [this.client],
                    customBlock.id,
                    customBlock.name,
                    customBlock.solidity,
                    customBlock.speed,
                    customBlock.top,
                    customBlock.left,
                    customBlock.right,
                    customBlock.front,
                    customBlock.back,
                    customBlock.bottom,
                    customBlock.transmitLight,
                    customBlock.sound,
                    customBlock.brightness,
                    customBlock.isLamp,
                    customBlock.minX,
                    customBlock.minY,
                    customBlock.minZ,
                    customBlock.maxX,
                    customBlock.maxY,
                    customBlock.maxZ,
                    customBlock.drawMode,
                    customBlock.fogDensity,
                    customBlock.fogR,
                    customBlock.fogG,
                    customBlock.fogB

                );
        
        // send env
        if (config.self.world.env.texturePackURL != "")
            new ServerSetMapEnvUrlPacket([this.client], config.self.world.env.texturePackURL);

        for (let key of Object.keys(lists.mapPropertyTypes))
            if (config.self.world.env.appearance[key] >= 0)
                new ServerSetMapEnvPropertyPacket([this.client], lists.mapPropertyTypes[key], config.self.world.env.appearance[key]);
        
        for (let key of Object.keys(lists.mapColorTypes))
            if (
                config.self.world.env.colors[key].r >= 0 &&
                config.self.world.env.colors[key].g >= 0 &&
                config.self.world.env.colors[key].b >= 0
            )
                new ServerEnvSetColorPacket(
                    [this.client],
                    lists.mapColorTypes[key],
                    config.self.world.env.colors[key].r,
                    config.self.world.env.colors[key].g,
                    config.self.world.env.colors[key].b
                );

        let lightingMode = 0;

        switch (config.self.world.env.lighting.mode) {
            case "classic":
                lightingMode = 1;
                break;

            case "fancy":
                lightingMode = 2;
                break;

        }

        if (lightingMode > 0)
            new ServerLightingModePacket([this.client], lightingMode, config.self.world.env.lighting.locked);

        let weatherType = -1;

        switch (config.self.world.env.weather) {
            case "sunny":
                weatherType = 0;
                break;

            case "raining":
                weatherType = 1;
                break;

            case "snowing":
                weatherType = 2;
                break;

        }

        if (weatherType >= 0)
            new ServerEnvSetWeatherTypePacket([this.client], weatherType);

        // tell client the world is final
        new ServerFinalPacket([this.client]);
        
        return true;
    }
}

module.exports = BehaviourIdentificationWorld;