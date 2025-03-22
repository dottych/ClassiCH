const Tag = require('../Tag');

const lists = require('../Lists');

class TagLongArray extends Tag {
    constructor(longArray) {
        super(lists.nbtTags.longArray);
        
        this.longArray = longArray;
    }
}

module.exports = TagLongArray;