const Tag = require('../Tag');

const lists = require('../Lists');

class TagByte extends Tag {
    constructor(byte) {
        super(lists.nbtTags.byte);

        this.byte = byte;
    }
}

module.exports = TagByte;