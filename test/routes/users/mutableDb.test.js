const request = require("supertest");
const BlogPost = require("../../../models/blogPost");
const Comment = require("../../../models/comment");
const Reaction = require("../../../models/reaction");
const ReactionCounter = require("../../../models/reactionCounter");
const setupTeardown = require('../utils/setupTeardown')
const usersRouter = require("../../../routes/users")


let server, autologinApp, loginUser

beforeEach(async () => {
    ({ server, autologinApp, loginUser } = await setupTeardown
        .loginSetup(usersRouter, '/users')
    )
})

afterEach(async () => {
    await setupTeardown.teardown(server)
})

describe('PUT /:username', () => {
    test("All fields except username", async () => {
        await request(autologinApp)
            .put(`/users/${loginUser.username}`)
            .set('Content-Type', "multipart/form-data")
            .field("profile-pic", "database/images/lightning.webp")
            .field("username", loginUser.username)
            .field("bio", "test")
            .field("keywords", 'one two')
            .expect("Content-Type", /html/)
            .expect(200)
    });
    
    // Requirement: no user has username 'Fre-ddy'
    test("Username", async () => {
        const newUsername = 'Fre-ddy'
    
        await request(autologinApp)
            .put(`/users/${loginUser.username}`)
            .set('Content-Type', "multipart/form-data")
            .field("profile-pic", "")
            .field("username", newUsername)
            .field("bio", "")
            .field("keywords", "")
            .expect("Content-Type", /html/)
            .expect(200)
    });
})

describe("POST /users/:username/blog-posts", () => {
    let url
    let title, keywords, content

    beforeEach(async () => {
        url = `/users/${loginUser.username}/blog-posts`

        // This blog post is public, so its properties are validated
        const publicBlogPost = await BlogPost
            .findOne({
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()

        ({ title, keywords, content } = publicBlogPost)
    })

    // Requirement: Title is the only required field on save
    // Requirement: publicBlogPost title must be unique (even to private version's)
    describe('Save', () => {
        test("Title", async () => {
            await request(autologinApp)
                .post(url)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'save')
                .expect(200);
            
            // Title should now be shared by two blog posts
            const blogPosts = await BlogPost
                .find({ title })
                .lean()
                .exec()
            
            expect(blogPosts.length).toBe(2)
        });
    })

    // Field 'content' has no notable invalid inputs
    // Requirement: publicBlogPost inputs must be collectively unique
    describe('Publish', () => {
        test("All fields", async () => {
            await request(autologinApp)
                .post(url)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("keywords", keywords.join(' '))
                .field("content", content)
                .field("word-count", '1000')
                .field('pre-method', 'publish')
                .expect(303);
            
            const blogPosts = await BlogPost
                .find({
                    title,
                    keywords,
                    content
                })
                .lean()
                .exec()
            
            expect(blogPosts.length).toBe(2)
        })
    })
})

// Requirements:
    // 1 - otherPublicBlogPost.title !== (publicVersion.title || privateVersion.title)
    // 2 - publicVersion and privateVersion differ on some input values
describe("PUT /users/:username/blog-posts/:blogPostId", () => {
    let urlTrunk
    // all except otherPublicBlogPost must be authored by loginUser
    let privateVersion, publicVersion
    let unpublishedBlogPost
    let otherPublicBlogPost

    beforeEach(async () => {
        urlTrunk = `/users/${loginUser.username}/blog-posts/`

        privateVersion = await BlogPost
            .findOne({
                author: loginUser._id,
                public_version: { $exists: true }
            })
            .populate('public_version')
            .lean()
            .exec()
        
        publicVersion = privateVersion.public_version

        unpublishedBlogPost = await BlogPost
            .findOne({
                author: loginUser._id,
                publish_date: { $exists: false}
            })
            .lean()
            .exec()

        otherPublicBlogPost = await BlogPost
            .findOne({
                _id: { $ne: publicVersion._id },
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()

        ({ title, keywords, content } = otherPublicBlogPost)
    })

    describe('Discard', () => {
        test("Blog post published", async () => {
            await request(autologinApp)
                .put(urlTrunk + privateVersion._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", '')
                .field("thumbnail", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'discard')
                .expect(303);
            
            // Check if private and public versions now match
            const newPrivateVersion = await BlogPost
                .findById(privateVersion._id)
                .lean()
                .exec()
            
            const primitivePaths = ['title', 'content']

            for (const path of primitivePaths) {
                expect(newPrivateVersion[path]).toBe(publicVersion[path])
            }

            const objectPaths = ['thumbnail', 'keywords']

            for (const path of objectPaths) {
                expect(newPrivateVersion[path]).toEqual(publicVersion[path])
            }
        });

        test("Blog post not published", async () => {
            await request(autologinApp)
                .put(urlTrunk + unpublishedBlogPost._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", '')
                .field("thumbnail", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'discard')
                .expect(303);
            
            // Confirm deletion
            const result = await BlogPost
                .findById(unpublishedBlogPost._id)
                .lean()
                .exec()
            
            expect(result).toBeNull()
        });
    })

    describe('Save', () => {
        test("Blog post published", async () => {
            await request(autologinApp)
                .put(urlTrunk + privateVersion._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("thumbnail", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'save')
                .expect(200);
            
            const blogPost = await BlogPost
                .findById(privateVersion._id)
                .lean()
                .exec()
            
            expect(blogPost.title).toBe(title)
        });

        test("Blog post not published", async () => {
            await request(autologinApp)
                .put(urlTrunk + unpublishedBlogPost._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("thumbnail", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'save')
                .expect(200);
            
            const blogPost = await BlogPost
                .findById(unpublishedBlogPost._id)
                .lean()
                .exec()
            
            expect(blogPost.title).toBe(title)
        });
    })

    describe('Publish', () => {
        test("Blog post published", async () => {
            await request(autologinApp)
                .put(urlTrunk + privateVersion._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("thumbnail", '../database/images/lightning.webp')
                .field("keywords", keywords.join(' '))
                .field("content", content)
                .field("word-count", '1000')
                .field('pre-method', 'publish')
                .expect(303);
            
            const updatedPrivate = await BlogPost
                .findById(privateVersion._id)
                .populate('public_version')
                .lean()
                .exec()
            const updatedPublic = updatedPrivate.public_version

            for (const blogPost of [updatedPrivate, updatedPublic]) {
                expect(blogPost.title).toBe(title)
                expect(blogPost.keywords).toEqual(keywords)
                expect(blogPost.content).toBe(content)
            }
        });

        test("Blog post not published", async () => {
            await request(autologinApp)
                .put(urlTrunk + unpublishedBlogPost._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", title)
                .field("thumbnail", '../database/images/lightning.webp')
                .field("keywords", keywords.join(' '))
                .field("content", content)
                .field("word-count", '1000')
                .field('pre-method', 'publish')
                .expect(303);
            
            const updatedPrivate = await BlogPost
                .findById(unpublishedBlogPost._id)
                .populate('public_version')
                .lean()
                .exec()
            const updatedPublic = updatedPrivate.public_version

            for (const blogPost of [updatedPrivate, updatedPublic]) {
                expect(blogPost.title).toBe(title)
                expect(blogPost.keywords).toEqual(keywords)
                expect(blogPost.content).toBe(content)
            }
        });
    })
})

// Previous tests passing ensures only private blog post deletion
describe("DELETE /users/:username/blog-posts/:blogPostId", () => {
    let urlTrunk
    let privateLoginUserBlogPost

    beforeEach(async () => {
        urlTrunk = `/users/${loginUser.username}/blog-posts/`

        privateLoginUserBlogPost = await BlogPost
            .findOne({
                author: loginUser._id,
                $or: [
                    { public_version: { $exists: true } },
                    { publish_date: { $exists: false} }
                ]
            })
            .lean()
            .exec()
    })

    test("Delete", async () => {
        await request(autologinApp)
            .delete(urlTrunk + privateLoginUserBlogPost._id)
            .expect(200)
        
        const result = await BlogPost
            .findById(privateLoginUserBlogPost._id)
            .lean()
            .exec()
        
        expect(result).toBeNull()
    });
})

// Requirement: comment and blog post must not have reaction from loginUser
describe("POST /users/:username/reactions", () => {
    let url
    let publicBlogPost, comment

    beforeEach(async () => {
        url = `/users/${loginUser.username}/reactions`

        const loginUserReactions = await Reaction
            .find({ user: loginUser._id })
            .lean()
            .exec()
        const loginUserReactionIds = loginUserReactions
            .map(reaction => reaction.content.content_id)
        
        publicBlogPost = await BlogPost
            .findOne({
                _id: { $nin: loginUserReactionIds },
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()
        comment = await Comment
            .findOne({
                _id: { $nin: loginUserReactionIds }
            })
            .lean()
            .exec()
    })

    test('All fields, liked blog post', async () => {
        await request(autologinApp)
            .post(url)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", publicBlogPost._id.toString())
            .field("content-type", 'BlogPost')
            .field("reaction-type", 'Like')
            .expect(200);

        // confirm creation of reaction (there can be 1 or 0, given requirements)
        const allLikeReactions = await Reaction
            .find({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                },
                reaction_type: 'Like'
            })
            .lean()
            .exec()
        const likeReactionUserIds = allLikeReactions.map(
            reaction => reaction.user
        )

        expect(likeReactionUserIds).toContainEqual(loginUser._id)
        
        // confirm correct reaction like count
        const reactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                }
            })
            .lean()
            .exec()
        
        expect(reactionCounter.like_count).toBe(allLikeReactions.length)
    })

    test('All fields, disliked comment', async () => {
        await request(autologinApp)
            .post(url)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", comment._id.toString())
            .field("content-type", 'Comment')
            .field("reaction-type", 'Dislike')
            .expect(200);
        
        // confirm creation of reaction (there can be 1 or 0, given requirements)
        const allLikeReactions = await Reaction
            .find({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                },
                reaction_type: 'Dislike'
            })
            .lean()
            .exec()
        const likeReactionUserIds = allLikeReactions.map(
            reaction => reaction.user
        )

        expect(likeReactionUserIds).toContainEqual(loginUser._id)
        
        // confirm correct reaction like count
        const reactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
            .lean()
            .exec()
        
        expect(reactionCounter.like_count).toBe(allLikeReactions.length)
    })
})

// Requirement: comment and blog post must have reaction from loginUser
describe("PUT /users/:username/reactions/:reactionId", () => {
    let urlTrunk
    let publicBlogPost, comment
    let blogPostReaction, commentReaction

    beforeEach(async () => {
        urlTrunk = `/users/${loginUser.username}/reactions/`

        const loginUserReactions = await Reaction
            .find({ user: loginUser._id })
            .lean()
            .exec()
        const loginUserReactionIds = loginUserReactions
            .map(reaction => reaction.content.content_id)
        
        publicBlogPost = await BlogPost
            .findOne({
                _id: { $in: loginUserReactionIds },
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()
        comment = await Comment
            .findOne({
                _id: { $in: loginUserReactionIds }
            })
            .lean()
            .exec()

        for (const reaction of loginUserReactions) {
            const contentId = reaction.content.content_id.toString()

            // Set reaction_type to the value it is to be updated to
            if (contentId === publicBlogPost._id.toString()) {
                if (reaction.reaction_type === 'Like') {
                    reaction.reaction_type = "Dislike"
                }
                else if (reaction.reaction_type === 'Dislike') {
                    reaction.reaction_type = "Like"
                }

                blogPostReaction = reaction
            }
            else if (contentId === comment._id.toString()) {
                if (reaction.reaction_type === 'Like') {
                    reaction.reaction_type = "Dislike"
                }
                else if (reaction.reaction_type === 'Dislike') {
                    reaction.reaction_type = "Like"
                }

                commentReaction = reaction
            }
        }
    })

    test("Update comment reaction", async () => {
        const oldReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
            .lean()
            .exec()

        await request(autologinApp)
            .put(urlTrunk + commentReaction._id)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", comment._id.toString())
            .field("content-type", 'Comment')
            .field("reaction-type", commentReaction.reaction_type)
            .expect(200)

        // confirm reaction updated
        const newReaction = await Reaction
            .findById(commentReaction._id)
            .lean()
            .exec()

        expect(newReaction.reaction_type).toBe(commentReaction.reaction_type)
    
        // confirm correct reaction counts
        const newReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
            .lean()
            .exec()

        if (newReaction.reaction_type === 'Like') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count - 1)
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count + 1)
        }
        else if (newReaction.reaction_type === 'Dislike') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count + 1)
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count - 1)
        }
    });

    test("Update blog post reaction", async () => {
        const oldReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                }
            })
            .lean()
            .exec()

        await request(autologinApp)
            .put(urlTrunk + blogPostReaction._id)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", publicBlogPost._id.toString())
            .field("content-type", 'BlogPost')
            .field("reaction-type", blogPostReaction.reaction_type)
            .expect(200)

        // confirm reaction updated
        const newReaction = await Reaction
            .findById(blogPostReaction._id)
            .lean()
            .exec()

        expect(newReaction.reaction_type).toBe(blogPostReaction.reaction_type)

        // confirm correct reaction counts
        const newReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                }
            })
            .lean()
            .exec()

        if (newReaction.reaction_type === 'Like') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count - 1)
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count + 1)
        }
        else if (newReaction.reaction_type === 'Dislike') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count + 1)
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count - 1)
        }
    })
})

// Requirement: comment and blog post must have reaction from loginUser
describe("DELETE /users/:username/reactions/:reactionId", () => {
    let urlTrunk
    let publicBlogPost, comment
    let blogPostReaction, commentReaction

    beforeEach(async () => {
        urlTrunk = `/users/${loginUser.username}/reactions/`

        const loginUserReactions = await Reaction
            .find({ user: loginUser._id })
            .lean()
            .exec()
        const loginUserReactionIds = loginUserReactions
            .map(reaction => reaction.content.content_id)
        
        publicBlogPost = await BlogPost
            .findOne({
                _id: { $in: loginUserReactionIds },
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()
        comment = await Comment
            .findOne({
                _id: { $in: loginUserReactionIds }
            })
            .lean()
            .exec()

        for (const reaction of loginUserReactions) {
            const contentId = reaction.content.content_id.toString()

            // Set reaction_type to the value it is to be updated to
            if (contentId === publicBlogPost._id.toString()) {
                blogPostReaction = reaction
            }
            else if (contentId === comment._id.toString()) {
                commentReaction = reaction
            }
        }
    })
    
    test("Delete comment reaction", async () => {
        const oldReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
            .lean()
            .exec()

        await request(autologinApp)
            .delete(urlTrunk + commentReaction._id)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", comment._id.toString())
            .field("content-type", 'Comment')
            .field("reaction-type", commentReaction.reaction_type)
            .expect(200)

        // confirm reaction deleted
        const result = await Reaction
            .findById(commentReaction._id)
            .lean()
            .exec()

        expect(result).toBeNull()
    
        // confirm correct reaction counts
        const newReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
            .lean()
            .exec()

        if (commentReaction.reaction_type === 'Like') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count + 1)
        }
        else if (commentReaction.reaction_type === 'Dislike') {
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count + 1)
        }
    });

    test("Delete blog post reaction", async () => {
        const oldReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                }
            })
            .lean()
            .exec()

        await request(autologinApp)
            .put(urlTrunk + blogPostReaction._id)
            .set('Content-Type', "multipart/form-data")
            .field("content-id", publicBlogPost._id.toString())
            .field("content-type", 'BlogPost')
            .field("reaction-type", blogPostReaction.reaction_type)
            .expect(200)

        // confirm reaction updated
        const result = await Reaction
            .findById(blogPostReaction._id)
            .lean()
            .exec()

        expect(result).toBeNull()

        // confirm correct reaction counts
        const newReactionCounter = await ReactionCounter
            .findOne({
                content: {
                    content_type: 'BlogPost',
                    content_id: publicBlogPost._id
                }
            })
            .lean()
            .exec()

        if (blogPostReaction.reaction_type === 'Like') {
            expect(oldReactionCounter.like_count).toBe(newReactionCounter.like_count + 1)
            
        }
        else if (blogPostReaction.reaction_type === 'Dislike') {
            expect(oldReactionCounter.dislike_count).toBe(newReactionCounter.dislike_count + 1)
        }
    })
})