const Tag = require('../Tag');

const lists = require('../Lists');

class TagCompound extends Tag {
    constructor(name) {
        super(lists.nbtTags.compound);

        this.name = name;
        this.tags = new Map();
    }

    /**
     * Adds a tag to this compound.
     * @param {string} name Name of the tag.
     * @param {Tag} tag Reference to a tag. Can be any tag.
     */
    addTag(name, tag) {
        this.tags.set(name, tag);
    }

    /**
     * Finds a tag by name and removes it from this compound.
     * @param {string} name Name of the tag.
     */
    removeTag(name) {
        this.tags.delete(name);
    }

    /**
     * Finds a tag by name and returns it.
     * @param {Tag} name Name of the tag.
     * @returns An instance of any Tag.
     */
    getTag(name) {
        return this.tags.get(name);
    }
}

module.exports = TagCompound;