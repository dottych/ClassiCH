const fs = require('fs');

// do not change this, this is strictly for 0.30 only (but 0.28 had 0x07 already)
const pvn = 0x07;
// do not change this as well, this is the server software's name, version and URLs
const name = "ClassiCH";
const version = "0.1.1 DEV";
const software = `&2${name} &7${version}`;
const softwareRaw = `${name} ${version}`;
const softwareUrl = "https://github.com/dottych/ClassiCH";
const versionUrl = "https://raw.githubusercontent.com/dottych/dottych.github.io/main/chver.txt";
// unique salt for this server session, defined by the Server class
let salt;

const self = JSON.parse(fs.readFileSync('./config.json').toString());

function checkCrucialConfig() {
    if (self.server.port <= 0 || self.server.port >= 65536) return false;

    if (self.server.name.length <= 0) return false;
    if (self.server.name.length > 64) return false;

    if (self.server.maxPlayers <= 0) return false;
    if (self.server.maxPlayers >= 128) return false;

    if (self.world.name.trim().length <= 0) return false;

    if (self.world.size.x < 16 || self.world.size.x > 1024) return false;
    if (self.world.size.y < 16 || self.world.size.y > 1024) return false;
    if (self.world.size.z < 16 || self.world.size.z > 1024) return false;

    if (self.world.size.x % 2 !== 0) return false;
    if (self.world.size.y % 2 !== 0) return false;
    if (self.world.size.z % 2 !== 0) return false;

    if (self.world.saveInterval <= 0) return false;

    for (let url of self.heartbeat.URLs)
        if (url.length <= 0) return false;

    if (self.heartbeat.interval <= 0) return false;

    // if everything is valid
    return true;
}

module.exports = {
    
    pvn,
    software,
    softwareRaw,
    softwareUrl,
    versionUrl,
    salt,
    checkCrucialConfig,
    self

};