require('dotenv').config()
const bcrypt = require('bcryptjs')
const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const Reaction = require("../models/reaction");
const path = require('path')
const fs = require('fs')

const users = [];
const blogPosts = [];
const comments = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connecter = process.env.MONGO_DB_CONNECT
main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(connecter);
    
    console.log("Debug: Should be connected?");
    await createUsers()
    await createBlogPosts()
    await createComments()
    await createReactions()

    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

// uses password hashing
async function userCreate(index, userData) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(userData.password, 10, async (err, hash) => {
            if (err) {
                reject(err)
            }
            
            const user = new User({
                username: userData.username,
                password: hash,
                profile_pic: userData.profile_pic
            });

            await user.save();
            users[index] = user;
            resolve(user);
        })
    })
}

async function blogPostCreate(index, blogPostData) {
    const blogPost = new BlogPost(blogPostData);
    await blogPost.save();
    blogPosts[index] = blogPost;
}

async function commentCreate(index, commentData) {
    const comment = new Comment(commentData);
    await comment.save();
    comments[index] = comment;
}

async function reactionCreate(reactionData) {
    const reaction = new Reaction(reactionData)
    await reaction.save()
}

async function createUsers() {
    console.log("Adding users")

    const profile_pic = {
        data: fs.readFileSync(
            path.join(
                process.cwd(),
                'test',
                'images',
                'hero-image.webp'
            )
        ),
        contentType: 'image/webp'
    }

    await Promise.all([
        userCreate(
            0, 
            { 
                username: 'aaaaaa', 
                password: 'aaaaaa',
                profile_pic

            }
        ),
        userCreate(
            1, 
            { 
                username: 'bbbbbb', 
                password: 'bbbbbb',
                profile_pic 
            }
        ),
        userCreate(
            2, 
            { 
                username: 'cccccc', 
                password: 'cccccc',
                profile_pic 
            }
        ),
        userCreate(
            3, 
            { 
                username: 'dddddd', 
                password: 'dddddd',
                profile_pic 
            }
        )
    ]);
}

async function createBlogPosts() {
    console.log("Adding blogPosts");

    const thumbnail = {
        data: fs.readFileSync(
            path.join(
                process.cwd(),
                'test',
                'images',
                'hero-image.webp'
            )
        ),
        contentType: 'image/webp'
    }
    const reactions = [
        {
            likes: 1,
            dislikes: 0
        },
        {
            likes: 1,
            dislikes: 1
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        }
    ]

    // public versions
    await Promise.all([
        blogPostCreate(
            0, 
            { 
                title: 'Local puppies adopted!',
                thumbnail,
                author: users[0],
                publish_date: Date.now(),
                last_modified_date: Date.now(),
                keywords: ['puppies'],
                content: 'Puppies adopted, everyone is happy!',
                likes: reactions[0].likes,
                dislikes: reactions[0].dislikes,
            }
        ),
        blogPostCreate(
            1, 
            { 
                title: 'Thugs have cars!',
                thumbnail,
                author: users[1],
                publish_date: Date.now(),
                last_modified_date: Date.now(),
                keywords: ['thugs', 'cars'],
                content: 'Thug cars are really loud! They must go!',
                likes: reactions[1].likes,
                dislikes: reactions[1].dislikes
            }
        )
    ]);

    // private versions (last 4 indexes are NOT published)
    await Promise.all([
        blogPostCreate(
            2, 
            { 
                title: 'Local puppies adopted!',
                thumbnail,
                author: users[0],
                publish_date: Date.now(),
                last_modified_date: Date.now(),
                keywords: ['puppies'],
                content: 'Puppies adopted, everyone is happy!',
                likes: reactions[2].likes,
                dislikes: reactions[2].dislikes,
                public_version: blogPosts[0]
            }
        ),
        blogPostCreate(
            3, 
            { 
                title: 'Thugs have cars!',
                thumbnail,
                author: users[1],
                publish_date: Date.now(),
                last_modified_date: Date.now(),
                keywords: ['thugs', 'cars'],
                content: 'Thug cars are really loud! They must go!',
                likes: reactions[3].likes,
                dislikes: reactions[3].dislikes,
                public_version: blogPosts[1]
            }
        ),
        blogPostCreate(
            4, 
            { 
                title: 'Spiders in my basement!',
                thumbnail,
                author: users[0],
                last_modified_date: Date.now(),
                keywords: ['spiders'],
                content: 'Adventurer, I need you to squish 80 spiders!',
                likes: reactions[4].likes,
                dislikes: reactions[4].dislikes
            }
        ),
        blogPostCreate(
            5, 
            { 
                title: 'Only you can prevent forest fires!',
                thumbnail,
                author: users[1],
                last_modified_date: Date.now(),
                keywords: ['fire', 'forest'],
                content: 'I smoked a forest yesterday and dreamt of magical jacuzzi.',
                likes: reactions[5].likes,
                dislikes: reactions[5].dislikes
            }
        ),
        // public versions
        blogPostCreate(
            6, 
            { 
                title: 'I shipped my pants!',
                thumbnail,
                author: users[0],
                last_modified_date: Date.now(),
                keywords: ['puppies'],
                content: 'I did not like my Amazon order so I am returning the pants, thanks Obama.',
                likes: reactions[6].likes,
                dislikes: reactions[6].dislikes, 
            }
        ),
        blogPostCreate(
            7, 
            { 
                title: 'Don\'t worry guys I\'m 6ft!',
                thumbnail,
                author: users[1],
                last_modified_date: Date.now(),
                keywords: ['thugs', 'cars'],
                content: 'I used to be 5\' 11.99" but now I\'m 6ft and no one can tell me otherwise!',
                likes: reactions[7].likes,
                dislikes: reactions[7].dislikes
            }
        ),
    ]);
}

async function createComments() {
    console.log("Adding comments");

    const reactions = [
        {
            likes: 1,
            dislikes: 0
        },
        {
            likes: 1,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 1
        },
        {
            likes: 1,
            dislikes: 1
        },
        {
            likes: 0,
            dislikes: 0
        },
        {
            likes: 0,
            dislikes: 0
        },
    ]

    await Promise.all([
        commentCreate(
            0,
            {
                author: users[2],
                blogPost: blogPosts[0],
                publish_date: Date.now(),
                content: 'Yay puppies!',
                likes: reactions[0].likes,
                dislikes: reactions[0].dislikes
            }
        ),
        commentCreate(
            1,
            {
                author: users[3],
                blogPost: blogPosts[0],
                publish_date: Date.now(),
                content: 'Everyone loves puppies!',
                likes: reactions[1].likes,
                dislikes: reactions[1].dislikes
            }
        ),
        commentCreate(
            2,
            {
                author: users[1],
                blogPost: blogPosts[1],
                publish_date: Date.now(),
                content: 'I am a thug and I am keeping my car!',
                likes: reactions[2].likes,
                dislikes: reactions[2].dislikes
            }
        ),
        commentCreate(
            3,
            {
                author: users[2],
                blogPost: blogPosts[1],
                publish_date: Date.now(),
                content: 'Thugs be tripping.',
                likes: reactions[3].likes,
                dislikes: reactions[3].dislikes
            }
        )
    ]);

    await Promise.all([
        commentCreate(
            4,
            {
                author: users[0],
                blogPost: blogPosts[0],
                publish_date: Date.now(),
                content: 'Puppies!',
                likes: reactions[4].likes,
                dislikes: reactions[4].dislikes,
                reply_to: comments[0]
            }
        ),
        commentCreate(
            5,
            {
                author: users[1],
                blogPost: blogPosts[1],
                publish_date: Date.now(),
                content: 'I will become mayor and take your car!',
                likes: reactions[5].likes,
                dislikes: reactions[5].dislikes,
                reply_to: comments[2]
            }
        )
    ])
}

async function createReactions() {
    console.log("Adding reactions");

    const reactions = []
    const postGroups = [
        {
            type: 'BlogPost',
            collection: blogPosts
        },
        {
            type: 'Comment',
            collection: comments
        }
    ]
    const reactionGroups = [
        {
            type: 'Like',
            keyName: 'likes'
        },
        {
            type: 'Dislike',
            keyName: 'dislikes'
        },
    ]

    let userIndex = 0

    for (const postGroup of postGroups) {
        const { type: postType, collection: posts } = postGroup

        for (const post of posts) {
            for (const reactionGroup of reactionGroups) {
                const { type: reactionType, keyName } = reactionGroup
    
                for (let i=0; i<post[keyName]; i++) {
                    reactions.push(
                        {
                            user: users[userIndex % users.length],
                            content: {
                                content_type: postType,
                                content_id: post
                            },
                            reaction_type: reactionType
                        }
                    )
    
                    userIndex++
                }
            }
        }

        
    }

    await Promise.all(
        reactions.map((reaction => reactionCreate(reaction)))
    )
}

