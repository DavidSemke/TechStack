const BlogModel = require("../models/Blog");
const CommentModel = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

  
// Display comment create form
exports.getCommentCreateForm = asyncHandler(async (req, res, next) => {
  res.render("commentForm");
});
  
// On comment create
exports.postComment = [
  // Validate and sanitize
  body("content")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage(
        "Comment must be more than 1 character and less than"
        + " 300 characters."
    )
    .escape(),

  // Process request
  asyncHandler(async (req, res, next) => {
    const content = req.body.content
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Render errors
      res.render("commentForm ", {
        content,
        errors: errors.array(),
      });

      return;
    } 
    
    const comment = new CommentModel({
        
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
exports.deleteComment = asyncHandler(async (req, res, next) => {
    await CommentModel.findByIdAndRemove(req.params.id);
    res.redirect("/");
});

// Display comment update form
exports.getCommentUpdateForm = asyncHandler(async (req, res, next) => {
    const comment = await CommentModel.findById(req.params.id).exec()

    if (comment === null) {
        res.redirect('/')
    }

    res.render("commentForm ", {
        content: comment.content,
        errors: errors.array(),
    });
});
    
// On comment update
exports.updateComment = [
    // Validate and sanitize
    body("content")
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage(
            "Comment must be more than 1 character and less than"
            + " 300 characters."
        )
        .escape(),

    // Process request
    asyncHandler(async (req, res, next) => {
        const content = req.body.content
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Render errors
            res.render("commentForm ", {
                content,
                errors: errors.array(),
            });

            return;
        }
        
        const comment = new CommentModel({
            
            // get current user !!!!!!!!!!!!!!!!
            // author: ...,

            publish_date: Date.now(),
            content,
            likes: 0,
            dislikes: 0,
            replies: []
        });

        await CommentModel.findOneAndReplace(
            {_id: req.params.id}, comment
        );
    }),
];