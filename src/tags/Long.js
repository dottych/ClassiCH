const Tag = require('../Tag');

const lists = require('../Lists');

class TagLong extends Tag {
    constructor(long) {
        super(lists.nbtTags.long);
        
        this.long = long;
    }
}

module.exports = TagLong;