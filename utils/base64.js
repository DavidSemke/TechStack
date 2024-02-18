const fsPromises = require('fs').promises
const path = require('path')


async function imagesToBase64(imagesPath) {
    const fileNames = await fsPromises.readdir(imagesPath)
    const base64Data = {}
    
    for (const fileName of fileNames) {
        const imagePath = path.join(imagesPath, fileName)
        const image = await fsPromises.readFile(imagePath)
        const data = image.toString('base64')
        const [name, ext] = fileName.split('.')
        base64Data[name] = `data:image/${ext};base64,${data}`
    }

    return base64Data
}


module.exports = {
    imagesToBase64
}