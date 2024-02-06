const request = require("supertest");
const BlogPost = require("../../models/blogPost");
const Comment = require("../../models/comment");
const Reaction = require("../../models/reaction");
const ReactionCounter = require("../../models/reactionCounter");
const User = require("../../models/user");
const populate = require('../database/populateDb')
const mongoose = require('mongoose')
const mongoConfig = require('./utils/mongoConfigTest')
const appTest = require('./utils/appTest')
const usersRouter = require("../../routes/users")

let server, guestApp, autologinApp, loginUser

beforeAll(async () => {
    guestApp = appTest.create(usersRouter, '/users')
    autologinApp = appTest.create(usersRouter, '/users', true)
})

beforeEach(async () => {
    server = await mongoConfig.startServer()
    await populate()
    loginUser = autologinApp.locals.loginUser
})

afterEach(async () => {
  await mongoose.connection.close()
  await mongoConfig.stopServer(server)
})

describe("GET /:username", () => {
    let otherUser

    beforeEach(async () => {
        otherUser = await User
            .findOne({username: { $ne: loginUser.username }})
            .lean()
            .exec()
    })

    // Requirement: username min length > 1
    describe('Invalid username', () => {
        test("Login user, privileged", async () => {
            await request(autologinApp)
                .get(`/users/x`)
                .expect("Content-Type", /html/)
                .expect(404);
        });
    })
    
    test("Login user, privileged", async () => {
        await request(autologinApp)
            .get(`/users/${loginUser.username}`)
            .expect("Content-Type", /html/)
            .expect(200);
    });

    test("Login user, not privileged", async () => {
        await request(autologinApp)
            .get(`/users/${otherUser.username}`)
            .expect("Content-Type", /html/)
            .expect(200);
    });

    test("Guest user", async () => {
        await request(guestApp)
            .get(`/users/${otherUser.username}`)
            .expect("Content-Type", /html/)
            .expect(200);
    });
    
})

describe("PUT /:username", () => {
    let otherUser

    beforeEach(async () => {
        otherUser = await User
            .findOne({username: { $ne: loginUser.username }})
            .lean()
            .exec()
    })

    // Requirement: username min length > 1
    describe('Invalid username', () => {
        test("Login user, privileged", async () => {
            await request(autologinApp)
                .put(`/users/x`)
                .expect("Content-Type", /html/)
                .expect(403);
        });
    })

    describe('Lack of privilege', () => {
        test("Login user, not privileged", async () => {
            await request(autologinApp)
                .put(`/users/${otherUser.username}`)
                .expect("Content-Type", /html/)
                .expect(403);
        });
        
        test("Guest user", async () => {
            await request(guestApp)
                .put(`/users/${otherUser.username}`)
                .expect("Content-Type", /html/)
                .expect(403);
        });
    })

    describe('Invalid inputs', () => {
        // Requirement: username min length > 1
        test("Username, char count", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '')
                .field("username", 'x')
                .field("bio", '')
                .field("keywords", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });

        test("Username, invalid chars", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '')
                .field("username", 'doofen?')
                .field("bio", '')
                .field("keywords", '')
                .expect("Content-Type", /json/)
                .expect(400);
            
            expect(res.body).toHaveProperty('errors')
        });

        test("Username, already exists", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '')
                .field("username", otherUser.username)
                .field("bio", '')
                .field("keywords", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });

        test("Profile pic", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '../database/images/tree.abc')
                .field("username", loginUser.username)
                .field("bio", '')
                .field("keywords", '')
                .expect("Content-Type", /json/)
                .expect(400);
            
            expect(res.body).toHaveProperty('errors')
        });

        // Requirement: bio max length < 1000
        test("Bio", async () => {
            const invalidBio = 'x'.repeat(1000)
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '')
                .field("username", loginUser.username)
                .field("bio", invalidBio)
                .field("keywords", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });
        
        // Requirement: max keywords < 100
        test("Keywords", async () => {
            const invalidKeywords = 'x '.repeat(100)
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("profile-pic", '')
                .field("username", loginUser.username)
                .field("bio", '')
                .field("keywords", invalidKeywords)
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });
    })
 
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

    test("Username", async () => {
        await request(autologinApp)
            .put(`/users/${loginUser.username}`)
            .set('Content-Type', "multipart/form-data")
            .field("profile-pic", "")
            .field("username", 'Fre-ddy')
            .field("bio", "")
            .field("keywords", "")
            .expect("Content-Type", /html/)
            .expect(200)
    });
})

// No more valid username or privilege checks past here
// As long as the previous invalid username and unprivileged checks 
// work, authorization is in effect
// Therefore, only autologinApp and loginUser will be used
describe("GET /users/:username/blog-posts", () => {
    test("Get", async () => {
        await request(autologinApp)
            .get(`/users/${loginUser.username}/blog-posts`)
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
        title = publicBlogPost.title
        keywords = publicBlogPost.keywords
        content = publicBlogPost.content
    })
    
    describe('Discard', () => {
        test("Redirect", async () => {
            await request(autologinApp)
                .post(url)
                .set('Content-Type', "multipart/form-data")
                .field("title", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'discard')
                .expect(303);
        });
    })

    // Requirements: Title is the only required field on save
    describe('Save', () => {
        describe('Invalid inputs', () => {
            test("Title", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", '')
                    .field("keywords", '')
                    .field("content", '')
                    .field("word-count", '')
                    .field('pre-method', 'save')
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            });
        })

        // Requirement: publicBlogPost title must be unique (even to private version's)
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
            
            // title should now be shared by three blog posts
            const blogPosts = await BlogPost
                .find({ title })
                .lean()
                .exec()
            
            expect(blogPosts.length).toBe(2)
        });
    })

    // Field 'content' has no notable invalid inputs
    describe('Publish', () => {
        describe('Invalid inputs', () => {
            test("Title", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", 'too short')
                    .field("keywords", keywords.join(' '))
                    .field("content", content)
                    .field("word-count", '1000')
                    .field('pre-method', 'publish')
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            })

            test("Keywords", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", title)
                    .field("keywords", '')
                    .field("content", content)
                    .field("word-count", '1000')
                    .field('pre-method', 'publish')
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            })

            test("Word count", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", title)
                    .field("keywords", keywords.join(' '))
                    .field("content", content)
                    .field("word-count", '1')
                    .field('pre-method', 'publish')
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            })
        })

        // Requirement: publicBlogPost inputs must be collectively unique
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
            
            expect(blogPosts.length).toBe(2)
        })
    })
})

describe("GET /users/:username/blog-posts/new-blog-post", () => {
    test("Get", async () => {
        await request(autologinApp)
            .get(`/users/${loginUser.username}/blog-posts/new-blog-post`)
            .expect("Content-Type", /html/)
            .expect(200)
    });
})

describe("GET /users/:username/blog-posts/:blogPostId", () => {
    let urlTrunk
    let privateLoginUserBlogPost
    let privateNonLoginUserBlogPost
    let publicLoginUserBlogPost

    beforeEach(async () => {
        urlTrunk = `/users/${loginUser.username}/blog-posts/`

        publicLoginUserBlogPost = await BlogPost
            .findOne({
                author: loginUser._id,
                public_version: { $exists: false },
                publish_date: { $exists: true }
            })
            .lean()
            .exec()
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
        privateNonLoginUserBlogPost = await BlogPost
            .findOne({
                author: { $ne: loginUser._id },
                $or: [
                    { public_version: { $exists: true } },
                    { publish_date: { $exists: false} }
                ]
            })
            .lean()
            .exec()
    })

    describe('Invalid blogPostId', () => {
        test("Non-existent blog post", async () => {
            await request(autologinApp)
              .get(urlTrunk + '000011112222333344445555')
              .expect("Content-Type", /html/)
              .expect(404);
        });
    
        test("Public blog post", async () => {
            await request(autologinApp)
              .get(urlTrunk + publicLoginUserBlogPost._id)
              .expect("Content-Type", /html/)
              .expect(403);
        });
    
        test("LoginUser not author of blog post", async () => {
            await request(autologinApp)
              .get(urlTrunk + privateNonLoginUserBlogPost._id)
              .expect("Content-Type", /html/)
              .expect(403);
        });
        
        test("Invalid ObjectId", async () => {
            await request(autologinApp)
              .get(urlTrunk + 'test')
              .expect("Content-Type", /html/)
              .expect(400);
        });
    })

    test("Get", async () => {
        await request(autologinApp)
          .get(urlTrunk + privateLoginUserBlogPost._id)
          .expect("Content-Type", /html/)
          .expect(200)
    });
})

// If above tests pass, blogPostId checks no longer required
// Validation checks no longer required (present in POST equivalent)
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
        title = otherPublicBlogPost.title
        keywords = otherPublicBlogPost.keywords
        content = otherPublicBlogPost.content
    })

    describe('Discard', () => {
        test("Blog post published", async () => {
            await request(autologinApp)
                .put(urlTrunk + privateVersion._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", '')
                .field("keywords", '')
                .field("content", '')
                .field("word-count", '')
                .field('pre-method', 'discard')
                .expect(303);
            
            // Check if private and public versions now match
            privateVersion = await BlogPost
                .findById(privateVersion._id)
                .lean()
                .exec()
            
            const primitivePaths = ['title', 'keywords', 'content']

            for (const path of primitivePaths) {
                expect(privateVersion[path]).toBe(publicVersion[path])
            }

            const objectPaths = ['thumbnail']

            for (const path of objectPaths) {
                expect(privateVersion[path]).toEqual(publicVersion[path])
            }
        });

        test("Blog post not published", async () => {
            await request(autologinApp)
                .put(urlTrunk + unpublishedBlogPost._id)
                .set('Content-Type', "multipart/form-data")
                .field("title", '')
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

    beforeAll(async () => {
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

// Blog post and comment reaction CRUD logic is identical
// Therefore, only blog post reaction validation is used for post
// Content id, content type, and reaction type checks done here
// Requirement: comment and blog post must not have reaction from loginUser
describe("POST /users/:username/reactions", () => {
    let url
    let privateBlogPost, publicBlogPost, comment

    beforeEach(async () => {
        url = `/users/${loginUser.username}/reactions`

        const loginUserReactions = await Reaction
            .find({ user: loginUser._id })
            .lean()
            .exec()
        const loginUserReactionIds = loginUserReactions
            .map(reaction => reaction.content.content_id)
        
        privateBlogPost = await BlogPost
            .findOne({
                $or: [
                    { public_version: { $exists: true } },
                    { publish_date: { $exists: false} }
                ]
            })
            .lean()
            .exec()
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

    describe('Invalid inputs', () => {
        describe('Content id', () => {
            test("Non-existent content", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", '000011112222333344445555')
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'Like')
                    .expect(404);
            });
        
            test("Invalid content", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", privateBlogPost._id.toString())
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'Like')
                    .expect(403);
            });

            test("Content type mismatch", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", publicBlogPost._id.toString())
                    .field("content-type", 'Comment')
                    .field("reaction-type", 'Like')
                    .expect(400);
            });
            
            test("Invalid ObjectId", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", 'test')
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'Like')
                    .expect(400);
            });
        })

        describe('Content type', () => {
            test("Not in ['Comment', 'BlogPost']", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", publicBlogPost._id.toString())
                    .field("content-type", 'test')
                    .field("reaction-type", 'Like')
                    .expect(400);
            });
        })

        describe('Reaction type', () => {
            test("Not in ['Like', 'Dislike']", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", publicBlogPost._id.toString())
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'test')
                    .expect(400);
            });
        })
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

// Reaction id checks done here
// Content id, reaction type, and content type checks done in above tests
// Requirement: comment and blog post must have reaction from loginUser
describe("PUT /users/:username/reactions/:reactionId", () => {
    let urlTrunk
    let publicBlogPost, comment
    let blogPostReaction, commentReaction, nonLoginUserReaction

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

        nonLoginUserReaction = await Reaction
            .findOne({
                user: { $ne: loginUser._id }
            })
    })

    describe('Invalid reactionId', () => {
        test("Non-existent reaction", async () => {
            await request(autologinApp)
              .put(urlTrunk + '000011112222333344445555')
              .expect("Content-Type", /html/)
              .expect(404);
        });
    
        test("Reaction does not belong to loginUser", async () => {
            await request(autologinApp)
              .put(urlTrunk + nonLoginUserReaction._id)
              .expect("Content-Type", /html/)
              .expect(403);
        });
        
        test("Invalid ObjectId", async () => {
            await request(autologinApp)
              .put(urlTrunk + 'test')
              .expect("Content-Type", /html/)
              .expect(400);
        });
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
        });
})

// No validation checks here - done in previous tests
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
        });
})