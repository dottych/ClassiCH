const Tag = require('../Tag');

const lists = require('../Lists');

class TagString extends Tag {
    constructor(string) {
        super(lists.nbtTags.string);
        
        this.string = string;
    }
}

module.exports = TagString;