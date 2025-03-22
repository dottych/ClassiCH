const Tag = require('../Tag');

const lists = require('../Lists');

class TagDouble extends Tag {
    constructor(double) {
        super(lists.nbtTags.double);
        
        this.double = double;
    }
}

module.exports = TagDouble;