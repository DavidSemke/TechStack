const entities = require('entities')
const _ = require('lodash')

function decodeObject(obj, filter=null) {
    const clone = _.cloneDeep(obj)

    for (const [key, value] of Object.entries(clone)) {

        if (filter !== null && !filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            clone[key] = decode(value)
        }
        else if (typeof value === 'object' && value !== null) {
            decodeObject(value, filter)
        }
    }

    return clone
}

function encodeObject(obj, filter=null) {
    const clone = _.cloneDeep(obj)

    for (const [key, value] of Object.entries(clone)) {

        if (filter !== null && !filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            clone[key] = encode(value)
        }
        else if (typeof value === 'object' && value !== null) {
            encodeObject(value, filter)
        }
    }

    return clone
}

function encode(str) {
    return entities.encodeHTML(str)
}

function decode(str) {
    return entities.decodeHTML(str)
}

module.exports = {
    encodeObject,
    decodeObject,
    encode,
    decode
}