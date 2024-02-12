const asyncHandler = require("express-async-handler");
const multer = require('multer')
const { Types } = require('mongoose');


// forbidCheck is a function that takes a document found using the
// objectId and returns true or false; resource forbidden on true
function setObjectIdDocument(
    reqObject, param, model, forbidCheck=null, populatePaths=[]
) {
    return asyncHandler(async (req, res, next) => {
        let objectId

        try {
            objectId = new Types.ObjectId(req[reqObject][param])
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;
    
            return next(err)
        }

        // first, check to see if resource exists
        let document

        const query = model
            .findById(objectId)
            .lean()
        
        for (const path of populatePaths) {
            query.populate(path)
        }

        document = await query.exec()
        
        if (document === null) {
            const err = new Error("Resource not found");
            err.status = 404;
            
            return next(err);
        }
        
        if (forbidCheck && forbidCheck(document)) {
            const err = new Error("Access to resource forbidden");
            err.status = 403;
            
            return next(err);
        }
    
        req.documents[param] = document
    
        next()
    })
}

function checkAuthorization(req, res, next) {
    if (
        !req.user
        || req.user.username !== req.params.username
    ) {
        const err = new Error("Access to resource forbidden")
        err.status = 403;
        
        return next(err);
    }

    next()
}

function handleMulterError(err, req, res, next) {
    if (!err) {
        return next()
    }

    if (err instanceof multer.MulterError) {
        req.fileLimitError = err
        
        return next()
    }
    
    next(err)
}


module.exports = {
    setObjectIdDocument,
    checkAuthorization,
    handleMulterError
}