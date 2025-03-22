const Tag = require('../Tag');

const lists = require('../Lists');

class TagShort extends Tag {
    constructor(short) {
        super(lists.nbtTags.short);
        
        this.short = short;
    }
}

module.exports = TagShort;