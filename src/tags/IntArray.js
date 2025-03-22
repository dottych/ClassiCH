const Tag = require('../Tag');

const lists = require('../Lists');

class TagIntArray extends Tag {
    constructor(intArray) {
        super(lists.nbtTags.intArray);
        
        this.intArray = intArray;
    }
}

module.exports = TagIntArray;