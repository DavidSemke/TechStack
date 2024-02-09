const asyncHandler = require("express-async-handler");
const multer = require('multer')
const { Types } = require('mongoose')


function setObjectIdDocument(
    reqObject, param, models, filter={}, populatePaths=[]
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
        let validModel, document

        for (const model of models) {
            document = await model
                .findById(objectId)
                .lean()
                .exec()
            
            if (document !== null) {
                validModel = model
                break
            }
        }
        
        if (document === null) {
            const err = new Error("Resource not found");
            err.status = 404;
            
            return next(err);
        }

        // now check if resource is accessible
        const query = validModel
            .findOne({
                _id: objectId,
                ...filter
            })
            .lean()
        
        for (const path of populatePaths) {
            query.populate(path)
        }

        document = await query.exec()
        
        if (document === null) {
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