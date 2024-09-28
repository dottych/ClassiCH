const ClientPacket = require('../../ClientPacket');

const BehaviourIdentificationCreate = require('../../Behaviours/Identification/BehaviourIdentificationCreate');
const BehaviourIdentificationInit = require('../../Behaviours/Identification/BehaviourIdentificationInit');
const BehaviourIdentificationWorld = require('../../Behaviours/Identification/BehaviourIdentificationWorld');
const BehaviourIdentificationSpawn = require('../../Behaviours/Identification/BehaviourIdentificationSpawn');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class ExtEntryPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.ext.entry);

        this.extName;
        this.extVersion;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.extName = utils.readString(this.buffer, 1);
        this.extVersion = utils.parseUInt32(utils.readUInt32(this.buffer, 1+64));
    }

    handle() {
        this.client.extensions[this.extName] = this.extVersion;

        // if client sent every extension info
        if (Object.entries(this.client.extensions).length >= this.client.extensionCount) {
            // continue off where identification behaviour stopped
            if (!new BehaviourIdentificationCreate(this.client, this.client.name, true).successful) return;
            if (!new BehaviourIdentificationInit(this.client, this.client.name).successful) return;
            if (!new BehaviourIdentificationWorld(this.client).successful) return;
            if (!new BehaviourIdentificationSpawn(this.client, this.client.name).successful) return;
        }
    }
}

module.exports = ExtEntryPacket;