const ClientPacket = require('../../ClientPacket');

const ServerCustomBlockSupportLevelPacket = require('../../server/ext/CustomBlockSupportLevel');
const ServerDisconnectPacket = require('../../server/Disconnect');

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
        this.extName = utils.readSpacelessString(this.buffer, 1);
        this.extVersion = utils.parseUInt32(utils.readUInt32(this.buffer, 1+64));
    }

    handle() {
        if (!isNaN(this.extVersion) && this.extVersion > 0)
            this.client.extensions[this.extName] = this.extVersion;

        // if client sent every extension info
        if (Object.entries(this.client.extensions).length >= this.client.extensionCount) {
            // check if client supports extensions given by server
            for (let serverExtension of Object.entries(lists.supportedExtensions)) {
                const serverExtensionName = serverExtension[0];
                const serverExtensionVersion = serverExtension[1];
                let supported = true;

                if (this.client.extensions[serverExtensionName] == undefined) supported = false;
                if (this.client.extensions[serverExtensionName] < serverExtensionVersion) supported = false;

                if (!supported) {
                    new ServerDisconnectPacket([this.client], "Your client doesn't support ClassiCH's CPE extensions!");
                    return;
                }
            }

            new ServerCustomBlockSupportLevelPacket([this.client]);
        }
    }
}

module.exports = ExtEntryPacket;