const Tag = require('../Tag');

const lists = require('../Lists');

class TagList extends Tag {
    constructor(listType) {
        super(lists.nbtTags.list);
        
        this.listType = listType;
        this.list = [];
    }

    /**
     * Adds a tag to the list only if it corresponds to the list type.
     * @param {Tag} tag Tag that corresponds to the list type.
     */
    addTag(tag) {
        if (tag.type === this.listType)
            this.list.push(tag);
    }
}

module.exports = TagList;