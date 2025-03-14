const ClientPacket = require('../ClientPacket');

const ServerDisconnectPacket = require ('../server/Disconnect');

const BehaviourIdentificationCheck = require('../Behaviours/Identification/BehaviourIdentificationCheck');
const BehaviourIdentificationCPE = require('../Behaviours/Identification/BehaviourIdentificationCPE');
const BehaviourIdentificationCreate = require('../Behaviours/Identification/BehaviourIdentificationCreate');
const BehaviourIdentificationInit = require('../Behaviours/Identification/BehaviourIdentificationInit');
const BehaviourIdentificationWorld = require('../Behaviours/Identification/BehaviourIdentificationWorld');
const BehaviourIdentificationSpawn = require('../Behaviours/Identification/BehaviourIdentificationSpawn');

const lists = require('../../Lists');
const utils = require('../../Utils');

class IdentificationPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.identification);

        this.pvn;
        this.name;
        this.key;
        this.cpe;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.pvn = this.buffer[1];
        this.name = utils.readSpacelessString(this.buffer, 2);
        this.key = utils.readSpacelessString(this.buffer, 2+64);
        this.cpe = this.buffer[2+64*2] === 0x42;
    }

    handle() {
        if (!this.cpe) {
            // TEMPORARY!
            new ServerDisconnectPacket([this.client], "Non-CPE clients aren't supported for now, sorry!");
            return;
        }

        if (!new BehaviourIdentificationCheck(this.client, this.pvn, this.name, this.key).successful) return;

        if (this.cpe) {
            if (!new BehaviourIdentificationCPE(this.client, this.pvn, this.name, this.key).successful) return;
        } else {
            if (!new BehaviourIdentificationCreate(this.client, this.name, this.cpe).successful) return;
            if (!new BehaviourIdentificationInit(this.client, this.name).successful) return;
            if (!new BehaviourIdentificationWorld(this.client).successful) return;
            if (!new BehaviourIdentificationSpawn(this.client, this.name).successful) return;
        }
    }
}

module.exports = IdentificationPacket;