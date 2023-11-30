const Blog = require("../models/blog");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

  
// Display blog
exports.getBlog = asyncHandler(async (req, res, next) => {
  
    // const [blog, comments] = await Promise.all([
    //     Blog.findById(req.params.id).exec(),
    //     Comment.find({ blog: req.params.id }).exec(),
    // ]);

    // if (blog === null) {
    //     const err = new Error("Blog not found");
    //     err.status = 404;
        
    //     return next(err);
    // }

    const blog = {
        'title': 'Latest Blog: We Went Fishing And Yes Fishing is a Sport.',
        'author': {
            'name': 'James Games'
        },
        'keywords': [
            'Tech', 
            'BigTech',
            'ShinyTech',
            'CoolTech',
            'NewTech',
            'FreshTech', 
            'SpicyTech', 
            'HeckTech',
            'SteakTech', 
            'BreakTech'
        ],
        'content': "Let me tell you a story about an itty bitty spider that fell down the stairs. It was a Wednesday. I think I had spaghetti on Wednesday, meatballs and everything. I should have spaghetti more often, but then it wouldn't be as special, you know? Also Mom only makes her special sauce once and a while, and the spaghetti simply is not the same without it.",
        'likes': 0,
        'dislikes': 0,
        'publish_date': '2020/12/12',
        'url': '#'
    }

    const comments = [
        {
            '_id': 0,
            'author': {
                'name': 'JJ Man'
            },
            'publish_date': '2020/12/12',
            'content': 'I like this',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        },
        {   
            '_id': 1,
            'author': {
                'name': 'Puny Goon'
            },
            'publish_date': '2020/12/13',
            'content': 'I don\'t like this',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        },
        {
            '_id': 2,
            'author': {
                'name': 'Trollmasterxd'
            },
            'publish_date': '2020/12/14',
            'content': 'Captain America: Civil War',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        }
    ]

    blog.comments = comments

    res.render(
        "pages/blog", 
        { 
            title: blog.title,
            blog
        }
    );
});

// Display comment create form
// exports.getCommentCreateForm = asyncHandler(async (req, res, next) => {
//     res.render("pages/commentForm");
// });
    
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
            res.render("pages/commentForm ", {
                content,
                errors: errors.array(),
            });

            return;
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
//     // Validate and sanitize
//     body("content")
//         .trim()
//         .isLength({ min: 1, max: 300 })
//         .withMessage(
//             "Comment must be more than 1 character and less than"
//             + " 300 characters."
//         )
//         .escape(),

//     // Process request
//     asyncHandler(async (req, res, next) => {
//         const content = req.body.content
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             // Render errors
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
