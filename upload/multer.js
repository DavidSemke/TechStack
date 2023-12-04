const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, file.fieldname 
          + '-' 
          + Date.now() 
          + path.extname(file.originalname)
      )
    }
  })
const upload = multer(
    {
        storage: storage,
        limits: {
            parts: 20,
            fileSize: 5000000 //limit image size to 5MB
        },
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/
            const mimetypes = /image\/(jpeg|png|gif)/

            const validFileType = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            )
            const validMimeType = mimetypes.test(file.mimetype)

            if (validFileType && validMimeType) {
                req.invalidFileType = false
                return cb(null, true)
            }
            else {
                req.invalidFileType = true
                return cb(null, false)
            }
        }
    }
)

module.exports = upload