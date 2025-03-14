const Behaviour = require('../../Behaviour');

const ServerDisconnectPacket = require('../../Server/Disconnect');

const utils = require('../../../Utils');
const lists = require('../../../Lists');
const config = require('../../../Config');

class BehaviourIdentificationCheck extends Behaviour {
    constructor(client, pvn, name, key) {
        super();

        this.client = client;
        
        this.pvn = pvn;
        this.name = name;
        this.key = key;

        this.successful = this.execute();
    }

    execute() {
        // does client's PVN match server's PVN?
        if (this.pvn !== config.pvn) {
            new ServerDisconnectPacket([this.client], "Version mismatch!");
            return false;
        }

        // does client's name's length fit?
        if (this.name.length <= 0 || this.name.length > 16) {
            new ServerDisconnectPacket([this.client], "Invalid name!");
            return false;
        }

        // does client's name have illegal characters?
        for (let char of this.name) {
            if (lists.characters.indexOf(char) < 0) {
                new ServerDisconnectPacket([this.client], "Invalid name!");
                return false;
            }
        }

        // is client's key valid? (if server has authentication enabled)
        if (config.self.server.authentication && this.key !== utils.generatePlayerKey(this.name)) {
            new ServerDisconnectPacket([this.client], "Invalid login!");
            return false;
        }

        // is server full?
        if (utils.getPlayerCount() >= config.self.server.maxPlayers) {
            new ServerDisconnectPacket([this.client], "The server is full!");
            return false;
        }
        
        // is client's name already connected? (if joinKick is on)
        if (!config.self.server.joinKick) {
            if (utils.isNameOnline(this.name)) {
                new ServerDisconnectPacket([this.client], "You are already connected!");
                return false;
            }
        }
        else {
            if (utils.isNameOnline(this.name))
                new ServerDisconnectPacket([utils.findPlayerByName(this.name).client], "Connected from another session!");
        }
        

        // is client's name banned?
        let ban = lists.bans[this.name];
        if (ban != undefined) {
            if (ban.trim() === "")
                new ServerDisconnectPacket([this.client], "You are banned!");
            else
                new ServerDisconnectPacket([this.client], `Banned: ${ban}`);
            
            return false;
        }

        this.client.name = this.name;
        
        return true;
    }
}

module.exports = BehaviourIdentificationCheck;