const fs = require('fs');

const utils = require('./Utils');
const lists = require('./Lists');

const TagEnd = require('./tags/End');
const TagByte = require('./tags/Byte');
const TagShort = require('./tags/Short');
const TagInt = require('./tags/Int');
const TagLong = require('./tags/Long');
const TagFloat = require('./tags/Float');
const TagDouble = require('./tags/Double');
const TagByteArray = require('./tags/ByteArray');
const TagString = require('./tags/String');
const TagList = require('./tags/List');
const TagCompound = require('./tags/Compound');
const TagIntArray = require('./tags/IntArray');
const TagLongArray = require('./tags/LongArray');

class NBT {
    // fill?
    constructor() {}
    
    /**
     * Adds a tag to a compound.
     * @param {TagCompound} compound Reference to the compound.
     * @param {string} name Name of the tag. If it's a compound, it must be the exact same.
     * @param {Tag} tag Reference to the tag. Can be any tag.
     */
    addToCompound(compound, name, tag) {
        if (tag.type === lists.nbtTags.compound)
            name = tag.name;

        compound.addTag(name, tag);
    }

    /**
     * Finds a tag by name and removes it from a compound.
     * @param {TagCompound} compound Reference to the compound.
     * @param {string} name Name of the tag.
     */
    removeFromCompound(compound, name) {
        compound.removeTag(name);
    }

    /**
     * Creates a new TagByte instance.
     * @param {number} byte A byte.
     * @returns TagByte instance.
     */
    createByte(byte) {
        return new TagByte(utils.clamp(byte, -128, 127));
    }

    /**
     * Creates a new TagShort instance.
     * @param {number} short A short.
     * @returns TagShort instance.
     */
    createShort(short) {
        return new TagShort(utils.clamp(short, -32768, 32767));
    }

    /**
     * Creates a new TagInt instance.
     * @param {number} int An integer.
     * @returns TagInt instance.
     */
    createInt(int) {
        return new TagInt(utils.clamp(int, -2147483648, 2147483647));
    }

    /**
     * Creates a new TagLong instance.
     * @param {number} long A long.
     * @returns TagLong instance.
     */
    createLong(long) {
        // no clamping could create problems but Math literally does not work with BigInt
        return new TagLong(long);
    }

    /**
     * Creates a new TagFloat instance.
     * @param {number} float A float.
     * @returns TagFloat instance.
     */
    createFloat(float) {
        // TODO: find out range of Float32 and add clamping
        return new TagFloat(float);
    }

    /**
     * Creates a new TagDouble instance.
     * @param {number} double A double.
     * @returns TagDouble instance.
     */
    createDouble(double) {
        // TODO: find out range of Float64 and add clamping
        return new TagDouble(double);
    }

    /**
     * Creates a new TagByteArray instance.
     * @param {array} byteArray Array of bytes.
     * @returns TagByteArray instance.
     */
    createByteArray(byteArray) {
        return new TagByteArray(byteArray);
    }

    /**
     * Creates a new TagString instance.
     * @param {string} string A string of any length.
     * @returns TagString instance.
     */
    createString(string) {
        return new TagString(string);
    }

    /**
     * Creates a new TagList instance.
     * @param {number} listType ID of the tags that the list holds.
     * @returns TagList instance.
     */
    createList(listType) {
        return new TagList(listType);
    }
    
    /**
     * Creates a new TagCompound instance.
     * @param {string} name Name of the compound.
     * @returns TagCompound instance.
     */
    createCompound(name) {
        return new TagCompound(name);
    }

    /**
     * Creates a new TagIntArray instance.
     * @param {array} intArray Array of integers.
     * @returns TagIntArray instance.
     */
    createIntArray(intArray) {
        return new TagIntArray(intArray);
    }

    /**
     * Creates a new TagLongArray instance.
     * @param {array} longArray Array of longs.
     * @returns TagLongArray instance.
     */
    createLongArray(longArray) {
        return new TagLongArray(longArray);
    }

    /**
     * Creates a compound inside a compound and returns the new compound.
     * @param {TagCompound} rootCompound Reference to the parent/root compound.
     * @param {string} name Name of the new compound.
     * @returns Newly created compound.
     */
    createCompoundInside(rootCompound, name) {
        const compound = this.createCompound(name);
        this.addToCompound(rootCompound, name, compound);
        return compound;
    }

    /**
     * An alias to createCompound (creates a new TagCompound Instance).
     * @param {string} name Name of the compound.
     * @returns TagCompound instance.
     */
    create(name) {
        return this.createCompound(name);
    }

    /**
     * Gets the buffer of a specified tag.
     * @param {Tag} tag Tag instance. Can be any tag.
     * @returns Tag converted to a buffer.
     */
    getBufferOfTag(tag) {
        const buffer = [];

        switch (tag.constructor.name) {
            case 'TagEnd':
                buffer.push(tag.end);
                break;

            case 'TagByte':
                buffer.push(utils.signedByte(tag.byte));
                break;

            case 'TagShort':
                buffer.push(...utils.int16(tag.short));
                break;

            case 'TagInt':
                buffer.push(...utils.int32(tag.int));
                break;

            case 'TagLong':
                buffer.push(...utils.int64(tag.long));
                break;
            
            case 'TagFloat':
                buffer.push(...utils.float32(tag.float));
                break;

            case 'TagDouble':
                buffer.push(...utils.float64(tag.double));
                break;

            case 'TagByteArray':
                buffer.push(...utils.int32(tag.byteArray.length));

                for (let byte of tag.byteArray)
                    buffer.push(utils.signedByte(byte));

                break;

            case 'TagString':
                const stringBuffer = Buffer.from(tag.string);

                buffer.push(...utils.uInt16(stringBuffer.length));
                buffer.push(...Buffer.from(tag.string));

                break;

            case 'TagList':
                buffer.push(tag.listType);
                buffer.push(...utils.int32(tag.list.length));

                for (let _tag of tag.list)
                    buffer.push(...this.getBufferOfTag(_tag));

                break;

            case 'TagCompound':
                const compoundNameBuffer = Buffer.from(tag.name);

                buffer.push(tag.type);
                buffer.push(...utils.uInt16(compoundNameBuffer.length));
                buffer.push(...compoundNameBuffer);

                for (let _tag of tag.tags) {
                    const tagNameBuffer = Buffer.from(_tag[0]);

                    // prevent writing compound information twice
                    if (_tag[1].type !== lists.nbtTags.compound) {
                        buffer.push(_tag[1].type);
                        buffer.push(...utils.uInt16(tagNameBuffer.length));
                        buffer.push(...tagNameBuffer);
                    }

                    buffer.push(...this.getBufferOfTag(_tag[1]));
                }

                buffer.push(...this.getBufferOfTag(new TagEnd()));

                break;

            case 'TagIntArray':
                buffer.push(...utils.int32(tag.intArray.length));

                for (let int of tag.intArray)
                    buffer.push(...utils.int32(int));

                break;

            case 'TagLongArray':
                buffer.push(...utils.int32(tag.longArray.length));

                for (let long of tag.longArray)
                    buffer.push(...utils.int64(long));

                break;
        }

        return buffer;
    }

    /**
     * Reads and parses an NBT file from a specified path.
     * @param {string} path Path of the NBT file.
     * @returns A TagCompound instance.
     */
    read(path) {
        const file = fs.readFileSync(path);

        return this.create("TODO");
    }

    /**
     * Writes a compound (NBT) to a file.
     * @param {TagCompound} compound Reference to a TagCompound instance.
     * @param {string} path Path of the file.
     */
    write(compound, path) {
        const buffer = [];

        buffer.push(...this.getBufferOfTag(compound));

        fs.writeFileSync(path, Buffer.from(buffer));
    }
}

module.exports = new NBT();