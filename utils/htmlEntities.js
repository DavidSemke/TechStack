const entities = require('entities')
const _ = require('lodash')

function decodeObject(obj, filter=null) {
    const clone = _.cloneDeep(obj)
    filter = filter || ((k, v)=>true)

    return decodeObjectInner(clone, filter)
}

function decodeObjectInner(obj, filter) {
    for (const [key, value] of Object.entries(obj)) {

        if (!filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            obj[key] = decode(value)
        }
        else if (typeof value === 'object' && value !== null) {
            obj[key] = decodeObject(value, filter)
        }
    }

    return obj
}

function decode(str) {
    return entities.decodeHTML(str)
}

function encodeObject(obj, filter=null) {
    const clone = _.cloneDeep(obj)
    filter = filter || ((k, v)=>true)

    return encodeObjectInner(clone, filter)
}

function encodeObjectInner(obj, filter) {
    for (const [key, value] of Object.entries(obj)) {

        if (!filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            obj[key] = encode(value)
        }
        else if (typeof value === 'object' && value !== null) {
            obj[key] = encodeObjectInner(value, filter)
        }
    }

    return obj
}

function encode(str) {
    return entities.encodeHTML(str)
}

module.exports = {
    encodeObject,
    decodeObject,
    encode,
    decode
}