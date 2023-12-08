const Blog = require("../models/blog");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

  
// Display blog
exports.getBlog = asyncHandler(async (req, res, next) => {
  
    const [blog, comments] = await Promise.all([
        Blog.findById(req.params.id).exec(),
        Comment.find({ blog: req.params.id }).exec(),
    ]);

    if (blog === null) {
        const err = new Error("Blog not found");
        err.status = 404;
        
        return next(err);
    }

    blog.comments = comments

    const data = {
        title: blog.title,
        blog
    }

    res.render("pages/blog", { data });
});

// Display comment create form
// exports.getCommentCreateForm = asyncHandler(async (req, res, next) => {
//     res.render("pages/commentForm");
// });
    
// On comment create
exports.postComment = [
    
    body("content")
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage(
            "Comment must be more than 1 character and less than"
            + " 300 characters."
        )
        .escape(),

    
    asyncHandler(async (req, res, next) => {
        const content = req.body.content
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const data = {
                content,
                errors: errors.array()
            }

            
            res.render("pages/commentForm ", { data })
        } 
    
        const comment = new Comment({
            
            // get current user !!!!!!!!!!!!!!!!
            // author: ...,

            publish_date: Date.now(),
            content,
            likes: 0,
            dislikes: 0,
            replies: []
        });

        await comment.save();
    }),
];


// On comment delete
// exports.deleteComment = asyncHandler(async (req, res, next) => {
//     await Comment.findByIdAndRemove(req.params.id).exec();
//     res.redirect("/");
// });

// Display comment update form
// exports.getCommentUpdateForm = asyncHandler(async (req, res, next) => {
//     const comment = await Comment.findById(req.params.id).exec()

//     if (comment === null) {
//         res.redirect('/')
//     }

//     res.render("pages/commentForm ", {
//         content: comment.content,
//         errors: errors.array(),
//     });
// });
    
// On comment update
// exports.updateComment = [
//     
//     body("content")
//         .trim()
//         .isLength({ min: 1, max: 300 })
//         .withMessage(
//             "Comment must be more than 1 character and less than"
//             + " 300 characters."
//         )
//         .escape(),

//     
//     asyncHandler(async (req, res, next) => {
//         const content = req.body.content
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             
//             res.render("pages/commentForm ", {
//                 content,
//                 errors: errors.array(),
//             });

//             return;
//         }
        
//         const comment = new Comment({
            
//             // get current user !!!!!!!!!!!!!!!!
//             // author: ...,

//             publish_date: Date.now(),
//             content,
//             likes: 0,
//             dislikes: 0,
//             replies: []
//         });

//         await Comment.findOneAndReplace(
//             {_id: req.params.id}, comment
//         ).exec();
//     }),
// ];
