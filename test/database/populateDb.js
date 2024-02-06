require('dotenv').config()
const bcrypt = require('bcryptjs')
const User = require("../../models/user");
const BlogPost = require("../../models/blogPost");
const Comment = require("../../models/comment");
const ReactionCounter = require("../../models/reactionCounter");
const Reaction = require("../../models/reaction");
const path = require('path')

const users = []
const blogPosts = []
const comments = []
const reactionCounters = []

async function populate() {
    const imageData = await readImageFile()
    await createUsers(imageData)
    await createBlogPosts(imageData)
    await createComments()
    await createReactionCounters()
    await createReactions()
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

async function reactionCounterCreate(index, counterData) {
    const counter = new ReactionCounter(counterData)
    await counter.save()
    reactionCounters[index] = counter
}

async function reactionCreate(reactionData) {
    const reaction = new Reaction(reactionData)
    await reaction.save()
}

async function createUsers(imageData) {
    await Promise.all([
        userCreate(
            0, 
            { 
                username: 'aaaaaa', 
                password: 'aaaaaa',
                profile_pic: imageData
            }
        ),
        userCreate(
            1, 
            { 
                username: 'bbbbbb', 
                password: 'bbbbbb',
                profile_pic: imageData 
            }
        ),
        userCreate(
            2, 
            { 
                username: 'cccccc', 
                password: 'cccccc',
                profile_pic: imageData 
            }
        ),
        userCreate(
            3, 
            { 
                username: 'dddddd', 
                password: 'dddddd',
                profile_pic: imageData 
            }
        )
    ]);
}

async function createBlogPosts(imageData) {
    let userIndex = 0;
    const completeDatas = variantDatas.map(data => {
        userIndex = userIndex ? 0 : 1

        return {
            title: data.title,
            thumbnail: imageData,
            author: users[userIndex],
            publish_date: Date.now(),
            last_modified_date: Date.now(),
            keywords: data.keywords,
            content: data.content,
        }
    })

    // Public versions
    // Keywords is changed for a private-public difference
    await Promise.all(
        completeDatas
            .map(data => {
                return {...data, keywords: data.keywords.slice(0, 1)}
            })
            .map(async (data, index) => {
                return blogPostCreate(index, data)
            })
    )

    const privatePublished = completeDatas
        .map((data, index) => {
            data.public_version = blogPosts[index]
            return blogPostCreate(index + 6, data)
        })

    await Promise.all([
        ...privatePublished,
        // Private, unpublished versions
        blogPostCreate(
            12, 
            { 
                title: 'Spiders in my basement!',
                thumbnail: imageData,
                author: users[0],
                last_modified_date: Date.now(),
                keywords: ['arachnid', 'scary'],
                content: '<p>Adventurer, I need you to squish 80 spiders!</p>',
            }
        ),
        blogPostCreate(
            13, 
            { 
                title: 'Only you can prevent forest fires!',
                thumbnail: imageData,
                author: users[1],
                last_modified_date: Date.now(),
                keywords: ['burn', 'wood'],
                content: '<p>I smoked a forest yesterday and dreamt of magical jacuzzi.</p>',
            }
        ),
        blogPostCreate(
            14, 
            { 
                title: 'I shipped my pants!',
                thumbnail: imageData,
                author: users[0],
                last_modified_date: Date.now(),
                keywords: ['amazon', 'bezos'],
                content: '<p>I did not like my Amazon order so I am returning the pants, thanks Obama.</p>',
            }
        ),
        blogPostCreate(
            15, 
            { 
                title: 'Don\'t worry guys I\'m 6ft!',
                thumbnail: imageData,
                author: users[1],
                last_modified_date: Date.now(),
                keywords: ['tall', 'short'],
                content: '<p>I used to be 5\' 11.99" but now I\'m 6ft and no one can tell me otherwise!</p>',
            }
        ),
    ]);
}

async function createComments() {
    await Promise.all([
        commentCreate(
            0,
            {
                author: users[2],
                blog_post: blogPosts[0],
                publish_date: Date.now(),
                content: 'Yay puppies!',
            }
        ),
        commentCreate(
            1,
            {
                author: users[3],
                blog_post: blogPosts[0],
                publish_date: Date.now(),
                content: 'Everyone loves puppies!',
            }
        ),
        commentCreate(
            2,
            {
                author: users[1],
                blog_post: blogPosts[1],
                publish_date: Date.now(),
                content: 'I am a thug and I am keeping my car!',
            }
        ),
        commentCreate(
            3,
            {
                author: users[2],
                blog_post: blogPosts[1],
                publish_date: Date.now(),
                content: 'Thugs be tripping.',
            }
        )
    ]);

    await Promise.all([
        commentCreate(
            4,
            {
                author: users[0],
                blog_post: blogPosts[0],
                publish_date: Date.now(),
                content: 'Puppies!',
                reply_to: comments[0]
            }
        ),
        commentCreate(
            5,
            {
                author: users[1],
                blog_post: blogPosts[1],
                publish_date: Date.now(),
                content: 'I will become mayor and take your car!',
                reply_to: comments[2]
            }
        )
    ])
}

async function createReactionCounters() {
    const reactionCounters = []
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
    const combns = [[1, 1], [1, 0], [0, 1], [0, 0]]
    let combnIndex = 0
    const publicBlogPostsCount = 6

    for (const postGroup of postGroups) {
        const { type: postType, collection: posts } = postGroup
        
        for (let i=0; i<posts.length; i++) {
            const post = posts[i]
            let likeCount = 0
            let dislikeCount = 0
        
            // first 6 blog posts are public and thus can have likes/dislikes
            if (i < publicBlogPostsCount) {
                [likeCount, dislikeCount] = combns[combnIndex % combns.length]
            }

            reactionCounters.push(
                {
                    content: {
                        content_type: postType,
                        content_id: post
                    },
                    like_count: likeCount,
                    dislike_count: dislikeCount
                }
            )

            combnIndex++
        }
    }

    await Promise.all(
        reactionCounters.map((
            (reactionCounter, index) => {
                return reactionCounterCreate(index, reactionCounter)
            }
        ))
    )
}

async function createReactions() {
    const reactions = []
    const postGroups = [
        {
            type: 'BlogPost',
            collection: blogPosts.slice(0, 6)
        },
        {
            type: 'Comment',
            collection: comments
        }
    ]
    let userIndex = 0

    for (const postGroup of postGroups) {
        const { type: postType, collection: posts } = postGroup

        for (let i=0; i<posts.length; i++) {
            const post = posts[i]
            const reactionCounter = reactionCounters[i]
            const likeCount = reactionCounter.like_count
            const dislikeCount = reactionCounter.dislike_count
            const reactionGroups = [
                {
                    reactionType: 'Like',
                    count: likeCount
                },
                {
                    reactionType: 'Dislike',
                    count: dislikeCount
                },
            ]

            for (const reactionGroup of reactionGroups) {
                const { reactionType, count } = reactionGroup
    
                for (let i=0; i<count; i++) {
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

module.exports = populate