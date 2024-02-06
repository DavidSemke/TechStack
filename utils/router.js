const BlogPost = require("../models/blogPost");
const asyncHandler = require("express-async-handler");
const multer = require('multer')
const { Types } = require('mongoose')


function setParamBlogPost(filter={}, populatePaths=[]) {
    return asyncHandler(async (req, res, next) => {
        let blogPostId

        try {
            blogPostId = new Types.ObjectId(req.params.blogPostId)
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;
    
            return next(err)
        }

        // first, check to see if resource exists
        let blogPost = await BlogPost
            .findById(blogPostId)
            .lean()
            .exec()

        if (blogPost === null) {
            const err = new Error("Blog post not found");
            err.status = 404;
            
            return next(err);
        }

        // now check if resource is accessible
        const query = BlogPost
            .findOne({
                _id: blogPostId,
                ...filter
            })
            .lean()
        
        for (const path of populatePaths) {
            query.populate(path)
        }

        blogPost = await query.exec()
        
        if (blogPost === null) {
            const err = new Error("Access to resource forbidden");
            err.status = 403;
            
            return next(err);
        }
    
        req.paramBlogPost = blogPost
    
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
    setParamBlogPost,
    checkAuthorization,
    handleMulterError
}