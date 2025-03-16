const ServerPacket = require('../../ServerPacket');

const lists = require('../../../Lists');
const utils = require('../../../Utils');

class SetCinematicGuiPacket extends ServerPacket {
    constructor(clients, hideCrosshair, hideHand, hideHotbar, r, g, b, opacity, barSize) {
        super(clients, lists.serverPackets.ext.setCinematicGui);

        // booleans
        this.hideCrosshair = hideCrosshair;
        this.hideHand = hideHand;
        this.hideHotbar = hideHotbar;
        // bytes
        this.r = r;
        this.g = g;
        this.b = b;
        this.opacity = opacity;
        // UInt16
        this.barSize = barSize;

        this.constructBuffer();
        super.send();
    }

    constructBuffer() {
        let data = [];

        data.push(

            this.type,
            this.hideCrosshair ? 1 : 0,
            this.hideHand ? 1 : 0,
            this.hideHotbar ? 1 : 0,
            this.r,
            this.g,
            this.b,
            this.opacity,
            ...utils.uInt16(this.barSize)

        );

        super.buffer = Buffer.from(data);
    }
}

module.exports = SetCinematicGuiPacket;