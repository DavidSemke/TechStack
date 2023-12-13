const entities = require('entities')

function decodeObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            obj[key] = entities.decodeHTML(value)
        }
        else if (typeof value === 'object' && value !== null) {
            obj[key] = decodeObject(value)
        }
    }

    return obj
}

function encodeObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            obj[key] = entities.encodeHTML(value)
        }
        else if (typeof value === 'object' && value !== null) {
            obj[key] = encodeObject(value)
        }
    }

    return obj
}

module.exports = {
    encodeObject,
    decodeObject
}