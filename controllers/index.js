const Blog = require('../models/blog.js')
const Comment = require('../models/comment.js')
const asyncHandler = require("express-async-handler");

exports.getIndex = asyncHandler(async (req, res, next) => {
    // const blogs = await Blog
    // .find()
    // .sort({ likes: 'desc' })
    // .exec();
  
    // completeBlogs = []
    
    // for (const blog of blogs) {
    //     const blogComments = await Comment
    //     .find({blog: blog._id})
    //     .exec()
        
    //     completeBlogs.push({ 
    //     ...blog, 
    //     commentCount: blogComments.length
    //     })
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

    blog.comments = ['a', 'b']
    
    res.render(
        "pages/index", 
        { 
            title: "Tech Stack",
            blogs: [blog, blog]
        }
    )
})