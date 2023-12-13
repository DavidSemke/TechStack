const entities = require('entities')

function decodeObject(obj, filter=null) {
    for (const [key, value] of Object.entries(obj)) {

        if (filter !== null && !filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            obj[key] = entities.decodeHTML(value)
        }
        else if (typeof value === 'object' && value !== null) {
            decodeObject(value, filter)
        }
    }
}

function encodeObject(obj, filter=null) {
    for (const [key, value] of Object.entries(obj)) {

        if (filter !== null && !filter(key, value)) {
            continue
        }
        
        if (typeof value === 'string') {
            obj[key] = entities.encodeHTML(value)
        }
        else if (typeof value === 'object' && value !== null) {
            encodeObject(value, filter)
        }
    }
}

module.exports = {
    encodeObject,
    decodeObject
}