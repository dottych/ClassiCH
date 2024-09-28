const fs = require('fs');

class Lists {
    constructor() {
        // connected players
        this.players = {};

        // commands with information, supplied by Commands.js
        this.commands = {};

        // opped players
        try {
            this.ops = JSON.parse(fs.readFileSync('./ops.json').toString());
        } catch(error) {
            this.ops = [];
            fs.writeFileSync('./ops.json', JSON.stringify(this.ops));
        }

        // banned players
        try {
            this.bans = JSON.parse(fs.readFileSync('./bans.json').toString());
        } catch(error) {
            this.bans = {};
            fs.writeFileSync('./bans.json', JSON.stringify(this.bans));
        }

        // greeting words
        try {
            this.greetings = JSON.parse(fs.readFileSync('./greetings.json').toString());
        } catch(error) {
            this.greetings = ["Welcome"];
            fs.writeFileSync('./greetings.json', JSON.stringify(this.greetings));
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
            0x11: 69 // nice
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
                "entry": 0x11
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
                "entry": 0x11
            }
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
            "LongerMessages": 1
        }
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
}

module.exports = new Lists();