const fs = require('fs');
const crypto = require('crypto');
const config = require('./Config');

class Utils {
    constructor() {
        this.base62 = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
    }

    /**
     * Converts a normal string into a packet string.
     * @param {string} string A string, 64 characters or less.
     * @returns {string} A string, padded to exactly 64 characters.
     */
    string(string) {
        let buffer = Buffer.alloc(64, 0x20);
        buffer.write(string);
        return [...buffer];
    }

    /**
     * Reads a packet string.
     * @param {Buffer} buffer Buffer with string. 
     * @param {number} byte Starting byte.
     * @returns {string} A normal string.
     */
    readString(buffer, byte) {
        let string = "";

        for (let i = 0; i < 64; i++) string += String.fromCharCode(buffer[byte+i]);

        // (none) is generated by the buffer
        if (string === "(none)") return "";
        return string;
    }

    /**
     * Reads a spaceless packet string.
     * @param {Buffer} buffer Buffer with string. 
     * @param {string} byte Starting byte.
     * @returns {string} A normal string.
     */
    readSpacelessString(buffer, byte) {
        let string = "";

        while (buffer[byte] != 0x20) {
            string += String.fromCharCode(buffer[byte]);
            byte++;
        }

        // (none) is generated by the buffer
        if (string === "(none)") return "";
        return string;
    }

    /**
     * Splits a string into 64 (or less) character strings.
     * @param {string} string A normal string.
     * @param {string} prefix A prefix, such as a color, for example &6. Doesn't have to be defined.
     * @returns An array of split strings.
     */
    splitString(string, prefix = "") {
        if (prefix === "")
            return string.match(new RegExp(`.{1,64}`, 'g'));

        let strings = string.match(new RegExp(`.{1,${64-prefix.length}}`, 'g'));

        for (let string in strings)
            strings[string] = prefix + strings[string];

        return strings;
    }

    /**
     * Converts an integer into a UInt16 array.
     * @param {number} int Any integer (under 65536).
     * @returns A Uint16 array.
     */
    uInt16(int) {
        let bytes = [];
        bytes.push(int >> 8 % 256);
        bytes.push(int % 256);
        return bytes;
    }

    /**
     * Reads a UInt16 from a buffer.
     * @param {Buffer} buffer Buffer containing a UInt16.
     * @param {number} byte Starting byte.
     * @returns UInt16 array.
     */
    readUInt16(buffer, byte) {
        let int = [];

        int.push(buffer[byte]);
        int.push(buffer[byte+1]);

        return int;
    }

    /**
     * Converts a UInt16 into a normal integer.
     * @param {object} int A UInt16 array.
     * @returns A normal integer.
     */
    parseUInt16(int) {
        return int[1] + int[0] * 256;
    }

    /**
     * Compares two UInt16 arrays.
     * @param {object} uInt16_1 UInt16 array.
     * @param {object} uInt16_2 UInt16 array.
     * @returns True if they are the same, false if not.
     */
    compareUInt16(uInt16_1, uInt16_2) {
        if (uInt16_1[0] !== uInt16_2[0]) return false;
        if (uInt16_1[1] !== uInt16_2[1]) return false;

        return true;
    }

    /**
     * Converts an integer into a UInt32 array.
     * @param {number} int Any integer (under 4294967296).
     * @returns A Uint32 array.
     */
    uInt32(int) {
        int = BigInt(int);

        let bytes = [];
        bytes.push(Number((int >> 24n) % 256n));
        bytes.push(Number((int >> 16n) % 256n));
        bytes.push(Number((int >> 8n) % 256n));
        bytes.push(Number(int % 256n));
        return bytes;
    }

    /**
     * Reads a UInt32 from a buffer.
     * @param {Buffer} buffer Buffer containing a UInt32.
     * @param {number} byte Starting byte.
     * @returns UInt32 array.
     */
    readUInt32(buffer, byte) {
        let int = [];

        int.push(buffer[byte]);
        int.push(buffer[byte+1]);
        int.push(buffer[byte+2]);
        int.push(buffer[byte+3]);

        return int;
    }

    // return BigInt, or just a normal int? think about this
    /**
     * Converts a UInt32 into a normal integer.
     * @param {object} int A UInt32 array.
     * @returns A normal integer.
     */
    parseUInt32(int) {
        return int[3] + int[2] * 256 + int[1] * 256**2 + int[0] * 256**3;
    }

    /**
     * Clamps an integer. Example: (11, 3, 9) would return 9.
     * @param {number} int An integer.
     * @param {number} min An integer minimum.
     * @param {number} max An integer maximum.
     * @returns Clamped integer.
     */
    clamp(int, min, max) {
        return Math.min(Math.max(int, min), max);
    }

    /**
     * Logs a message into console and/or file.
     * @param {string} message Message to log.
     */
    log(message) {
        if (!config.self.logging.console) return;

        let time = new Date().toUTCString();
        console.log(`[${time}] ${message}`);

        if (!config.self.logging.file) return;

        fs.appendFileSync('./log.txt', `[${time}] ${message}\n`);
    }

    /**
     * Finds the first unused player ID.
     * @param {object} players All online players.
     * @returns Player ID.
     */
    findFirstUnusedID(players) {
        // TODO elsewhere: if we return 0xFF, assume it's an error and kick joiner, because all clients assume 255 is their ID
        for (let i = 0; i <= 255; i++)
            if (players[i] == undefined) 
                return i;

        return 255;
    }

    /**
     * Generates a random salt for authentication.
     * @returns 16 character salt string.
     */
    generateRandomSalt() {
        let salt = "";

        for (let i = 0; i < 16; i++) {
            salt += this.base62[Math.floor(Math.random() * this.base62.length)];
        }
        
        return salt;
    }

    /**
     * Generates a player key for authentication.
     * @param {string} name Player's name.
     * @returns Player's key (mppass).
     */
    generatePlayerKey(name) {
        return crypto.createHash("md5").update(config.salt + name).digest("hex");
    }

    /**
     * Finds if player is online.
     * @param {string} name Player's name.
     * @param {object} players All online players.
     * @returns True if online, false if not.
     */
    isNameOnline(name, players) {
        for (let player of Object.values(players))
            if (player.name === name) return true;

        return false;
    }

    /**
     * Finds a player by name.
     * @param {string} name Player's name.
     * @param {object} players All online players.
     * @returns Player class.
     */
    findPlayerByName(name, players) {
        for (let player of Object.values(players))
            if (player.name === name) return player;

        return;
    }

    /**
     * Finds how many players are online.
     * @param {object} players All online players.
     * @returns Integer with player count.
     */
    getPlayerCount(players) {
        return Object.keys(players).length;
    }

    /**
     * Finds all player clients.
     * @param {object} players All online players.
     * @returns An array with player clients.
     */
    getAllPlayerClients(players) {
        let clients = [];

        for (let player of Object.values(players))
            clients.push(player.client);
        
        return clients;
    }

    /**
     * Finds all player clients except for the one specified.
     * @param {Socket} client
     * @param {object} players All online players.
     * @returns An array with player clients.
     */
    getOtherPlayerClients(client, players) {
        let clients = [];

        for (let player of Object.values(players))
            if (client != player.client) clients.push(player.client);
        
        return clients;
    }

    /**
     * Finds all OP player clients.
     * @param {object} players All online players.
     * @returns An array with OP clients.
     */
    getOpClients(players) {
        let clients = [];

        for (let player of Object.values(players))
            if (player.op) clients.push(player.client);

        return clients;
    }

    /**
     * Gets server's local time in 24-hour format, HH:MM:SS.
     * @returns Time as string.
     */
    getServerTime() {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    /**
     * Populates placeholder values with real values.
     * @param {string} string A string with placeholder values.
     * @param {object} populations An object with needed real values.
     * @returns A string with real values.
     */
    populate(string, populations) {
        string = string.replaceAll("%servername%", config.self.server.name);
        string = string.replaceAll("%maxplayers%", config.self.server.maxPlayers);
        string = string.replaceAll("%playercount%", populations.playerCount.toString());
        string = string.replaceAll("%playername%", populations.playerName);
        string = string.replaceAll("%greeting%", populations.greetings[Math.floor(Math.random() * populations.greetings.length)]);
        string = string.replaceAll("%time%", this.getServerTime());

        return string;
    }

    /**
     * Splits a string by lines.
     * @param {string} string Any string.
     * @returns Array with split strings.
     */
    getLines(string) {
        return string.replaceAll('\r', '').split('\n');
    }
}

module.exports = new Utils();