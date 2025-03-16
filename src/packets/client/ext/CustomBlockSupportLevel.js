const ClientPacket = require('../../ClientPacket');

const lists = require('../../../Lists');

const BehaviourIdentificationCreate = require('../../behaviours/Identification/BehaviourIdentificationCreate');
const BehaviourIdentificationInit = require('../../behaviours/Identification/BehaviourIdentificationInit');
const BehaviourIdentificationWorld = require('../../behaviours/Identification/BehaviourIdentificationWorld');
const BehaviourIdentificationSpawn = require('../../behaviours/Identification/BehaviourIdentificationSpawn');

class CustomBlockSupportLevelPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.ext.customBlockSupportLevel);

        this.blockSupportLevel;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.blockSupportLevel = this.buffer[1];
    }

    handle() {
        // just set it, server does not support "poor" clients anyway
        this.client.blockSupportLevel = this.blockSupportLevel;

        // continue off where identification behaviour stopped
        if (!new BehaviourIdentificationCreate(this.client, this.client.name, true).successful) return;
        if (!new BehaviourIdentificationInit(this.client, this.client.name).successful) return;
        if (!new BehaviourIdentificationWorld(this.client).successful) return;
        if (!new BehaviourIdentificationSpawn(this.client, this.client.name).successful) return;
    }
}

module.exports = CustomBlockSupportLevelPacket;