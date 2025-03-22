const Tag = require('../Tag');

const lists = require('../Lists');

class TagFloat extends Tag {
    constructor(float) {
        super(lists.nbtTags.float);
        
        this.float = float;
    }
}

module.exports = TagFloat;