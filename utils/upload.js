const multer = require("multer")
const path = require("path")

const upload = multer({
  limits: {
    parts: 20,
    fileSize: 1000000, // limit image size to 1MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/
    const mimetypes = /image\/(jpeg|png|webp|gif)/

    const validFileType = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    )
    const validMimeType = mimetypes.test(file.mimetype)

    if (validFileType && validMimeType) {
      req.fileTypeError = false
      return cb(null, true)
    } else {
      req.fileTypeError = true
      return cb(null, false)
    }
  },
})

module.exports = upload
