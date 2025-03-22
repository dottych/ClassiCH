const fs = require('fs');

class Lists {
    constructor() {
        // connected players
        this.players = new Map();

        // commands with information, supplied by Commands.js
        this.commands = {};

        // opped players
        try {
            this.ops = JSON.parse(fs.readFileSync('./ops.json').toString());
        } catch(error) {
            require('./Utils').log("Creating ops.json");
            
            this.ops = [];
            fs.writeFileSync('./ops.json', JSON.stringify(this.ops));
        }

        // banned players
        try {
            this.bans = JSON.parse(fs.readFileSync('./bans.json').toString());
        } catch(error) {
            require('./Utils').log("Creating bans.json");

            this.bans = {};
            fs.writeFileSync('./bans.json', JSON.stringify(this.bans));
        }

        // greeting words
        try {
            this.greetings = require('./Utils').getLines(fs.readFileSync('./greetings.txt').toString());
        } catch(error) {
            require('./Utils').log("Creating greetings.txt");

            this.greetings = ["Welcome"];
            fs.writeFileSync('./greetings.txt', this.greetings.join('\n'));
        }

        // announcements
        try {
            this.announcements = require('./Utils').getLines(fs.readFileSync('./announcements.txt').toString());
        } catch(error) {
            require('./Utils').log("Creating announcements.txt");

            this.announcements = ["This server hasn't set up its announcer yet!"];
            fs.writeFileSync('./announcements.txt', this.announcements.join('\n'));
        }

        // allowed name characters
        this.characters = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"];

        // allowed chat characters
        this.chatCharacters = [...this.characters, ..." `~!@#$%^*()+-={}[]<>:;\"'\\|,./?"];

        // lengths of client packets (unfortunately has to stay for now...)
        this.clientPacketLengths = {
            0x00: 131,
            0x05: 9,
            0x08: 10,
            0x0D: 66,
            0x10: 67,
            0x11: 69, // nice
            0x13: 2,
            0x2B: 4
        }
        
        // client packet list
        this.clientPackets = {
            "identification": 0x00,
            "block": 0x05,
            "movement": 0x08,
            "message": 0x0D,

            // protocol extension packets
            "ext": {
                "info": 0x10,
                "entry": 0x11,
                "customBlockSupportLevel": 0x13,
                "twoWayPing": 0x2B
            }
        }

        // server packet list
        this.serverPackets = {
            "identification": 0x00,
            "ping": 0x01,
            "init": 0x02,
            "chunk": 0x03,
            "final": 0x04,
            "block": 0x06,
            "spawn": 0x07,
            "teleport": 0x08,
            "movement": 0x09,
            "position": 0x0A,
            "rotation": 0x0B,
            "despawn": 0x0C,
            "message": 0x0D,
            "disconnect": 0x0E,
            "type": 0x0F,

            // protocol extension packets
            "ext": {
                "info": 0x10,
                "entry": 0x11,
                "customBlockSupportLevel": 0x13,
                "envSetColor": 0x19,
                "changeModel": 0x1D,
                "envSetWeatherType": 0x1F,
                "defineBlock": 0x23,
                "defineBlockExt": 0x25,
                "setMapEnvUrl": 0x28,
                "setMapEnvProperty": 0x29,
                "twoWayPing": 0x2B,
                "lightingMode": 0x37,
                "setCinematicGui": 0x38
            }
        }

        this.nbtTags = {
            "end": 0x00,
            "byte": 0x01,
            "short": 0x02,
            "int": 0x03,
            "long": 0x04,
            "float": 0x05,
            "double": 0x06,
            "byteArray": 0x07,
            "string": 0x08,
            "list": 0x09,
            "compound": 0x0A,
            "intArray": 0x0B,
            "longArray": 0x0C
        }

        this.answers = [
            "It is certain",
            "It is decidedly so",
            "Without a doubt",
            "Yes definitely",
            "You may rely on it",
            "As I see it yes",
            "Most likely",
            "Outlook good",
            "Yes",
            "Signs point to yes",
            "Reply hazy try again",
            "Ask again later",
            "Better not tell you now",
            "Cannot predict now",
            "Concentrate and ask again",
            "Don't count on it",
            "My reply is no",
            "My sources say no",
            "Outlook not so good",
            "Very doubtful"
        ];

        this.supportedExtensions = {
            "BlockDefinitions": 1,
            "BlockDefinitionsExt": 2,
            "ChangeModel": 1,
            "CinematicGui": 1,
            "CustomBlocks": 1,
            "EnvColors": 1,
            "EnvMapAspect": 1,
            "EnvWeatherType": 1,
            "InstantMOTD": 1,
            "LightingMode": 1,
            "LongerMessages": 1,
            "MessageTypes": 1,
            "TwoWayPing": 1
        }

        this.mapColorTypes = {
            sky: 0,
            clouds: 1,
            fog: 2,
            shadows: 3,
            sunlight: 4,
            skybox: 5, // was testing and this might actually be unused?
            lava: 6,
            lamp: 7
        }

        this.mapPropertyTypes = {
            mapSideID: 0, // bedrock part
            mapEdgeID: 1, // water part
            mapEdgeHeight: 2,
            mapCloudsHeight: 3,
            fogDistance: 4,
            cloudsSpeed: 5,
            weatherSpeed: 6,
            weatherFade: 7,
            exponentialFog: 8, // false or true
            sideEdgeOffset: 9 // side offset from edge, default -2
        }

        this.customBlocks = {};
        this.blockLimit = 65; // is replaced with highest ID from custom block list
        // also 65 is the last block in block support level 1

        this.addCustomBlocks();
    }

    addOp(name) {
        if (this.ops.indexOf(name) >= 0) return false;

        this.ops.push(name);
        fs.writeFileSync('./ops.json', JSON.stringify(this.ops));

        return true;
    }

    addBan(name, reason) {
        if (this.bans[name] != undefined) return false;

        this.bans[name] = reason;
        fs.writeFileSync('./bans.json', JSON.stringify(this.bans));

        return true;
    }

    removeOp(name) {
        let index = this.ops.indexOf(name);
        
        if (index >= 0) {
            this.ops.splice(index, 1);
            fs.writeFileSync('./ops.json', JSON.stringify(this.ops));

            return true;
        } else
            return false;
        
    }

    removeBan(name) {
        if (this.bans[name] != undefined) {
            delete this.bans[name];
            fs.writeFileSync('./bans.json', JSON.stringify(this.bans));

            return true;
        } else
            return false;
        
    }

    addCustomBlocks() {
        this.customBlocks = {};

        for (let customBlock of fs.readdirSync('../server/blocks/')) {
            // check if it's a module
            if (!customBlock.endsWith('.js')) continue;
        
            // remove ".js" from the end
            customBlock = customBlock.slice(0, -3);
        
            // register custom block and add it to the list
            try {
                this.customBlocks[customBlock] = new (require(`../server/blocks/${customBlock}`));

                if (this.customBlocks[customBlock].id > this.blockLimit)
                    this.blockLimit = this.customBlocks[customBlock].id;

            } catch(error) {
                console.log(error);
                delete this.customBlocks[customBlock];
            }
        }
    }
}

module.exports = new Lists();