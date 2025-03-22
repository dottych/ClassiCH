const Tag = require('../Tag');

const lists = require('../Lists');

class TagInt extends Tag {
    constructor(int) {
        super(lists.nbtTags.int);
        
        this.int = int;
    }
}

module.exports = TagInt;