const Tag = require('../Tag');

const lists = require('../Lists');

class TagByteArray extends Tag {
    constructor(byteArray) {
        super(lists.nbtTags.byteArray);
        
        this.byteArray = byteArray;
    }
}

module.exports = TagByteArray;