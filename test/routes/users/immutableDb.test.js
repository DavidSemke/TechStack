const request = require("supertest");
const BlogPost = require("../../../models/blogPost");
const Reaction = require("../../../models/reaction");
const User = require("../../../models/user");
const setupTeardown = require('../../utils/setupTeardown')
const usersRouter = require("../../../routes/users")


let server, guestApp, autologinApp, loginUser
let nonLoginUser

beforeAll(async () => {
    ({ server, guestApp, autologinApp, loginUser } = await setupTeardown
        .loginSetup(usersRouter, '/users', false)
    )

    nonLoginUser = await User
        .findOne({_id: { $ne: loginUser._id }})
        .lean()
        .exec()
})

afterAll(async () => {
    await setupTeardown.teardown(server)
})

describe("GET /:username", () => {
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
            .get(`/users/${nonLoginUser.username}`)
            .expect("Content-Type", /html/)
            .expect(200);
    });

    test("Guest user", async () => {
        await request(guestApp)
            .get(`/users/${nonLoginUser.username}`)
            .expect("Content-Type", /html/)
            .expect(200);
    });
})

describe("PUT /:username", () => {
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
                .put(`/users/${nonLoginUser.username}`)
                .expect("Content-Type", /html/)
                .expect(403);
        });
        
        test("Guest user", async () => {
            await request(guestApp)
                .put(`/users/${nonLoginUser.username}`)
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
                .field("username", 'x')
                .field("bio", '')
                .field("keywords", '')
                .attach("profile-pic", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });

        test("Username, invalid chars", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("username", 'doofen?')
                .field("bio", '')
                .field("keywords", '')
                .attach("profile-pic", '')
                .expect("Content-Type", /json/)
                .expect(400);
            
            expect(res.body).toHaveProperty('errors')
        });

        test("Username, already exists", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("username", nonLoginUser.username)
                .field("bio", '')
                .field("keywords", '')
                .attach("profile-pic", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });

        test("Profile pic", async () => {
            const res = await request(autologinApp)
                .put(`/users/${loginUser.username}`)
                .set('Content-Type', "multipart/form-data")
                .field("username", loginUser.username)
                .field("bio", '')
                .field("keywords", '')
                .attach(
                    "profile-pic", 
                    `${process.cwd()}/test/database/images/tree.abc`
                )
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
                .field("username", loginUser.username)
                .field("bio", invalidBio)
                .field("keywords", '')
                .attach("profile-pic", '')
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
                .field("username", loginUser.username)
                .field("bio", '')
                .field("keywords", invalidKeywords)
                .attach("profile-pic", '')
                .expect("Content-Type", /json/)
                .expect(400);

            expect(res.body).toHaveProperty('errors')
        });
    })
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

    beforeAll(async () => {
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
                .attach("thumbnail", '')
                .expect(303);
        });
    })

    // Requirement: Title is the only required field on save
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
                    .attach("thumbnail", '')
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            });
        })
    })

    // Field 'content' has no notable invalid inputs
    describe('Publish', () => {
        describe('Invalid inputs', () => {
            test("Title", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", '')
                    .field("keywords", keywords.join(' '))
                    .field("content", content)
                    .field("word-count", '1000')
                    .field('pre-method', 'publish')
                    .attach(
                        "thumbnail", 
                        `${process.cwd()}/test/database/images/lightning.webp`
                    )
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
                    .attach(
                        "thumbnail", 
                        `${process.cwd()}/test/database/images/lightning.webp`
                    )
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
                    .attach(
                        "thumbnail", 
                        `${process.cwd()}/test/database/images/lightning.webp`
                    )
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            })

            test("Thumbnail", async () => {
                const res = await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("title", title)
                    .field("keywords", keywords.join(' '))
                    .field("content", content)
                    .field("word-count", '1000')
                    .field('pre-method', 'publish')
                    .attach(
                        "thumbnail", 
                        `${process.cwd()}/test/database/images/tree.abc`
                    )
                    .expect("Content-Type", /json/)
                    .expect(400);
    
                expect(res.body).toHaveProperty('errors')
            })
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

    beforeAll(async () => {
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

// If above tests pass, 
// 1 - blogPostId checks no longer required
// 2 - validation checks no longer required
// Since blog post and comment reaction CRUD logic is identical,
// only blog post reaction validation is used here
// Content id, content type, and reaction type checks done here
describe("POST /users/:username/reactions", () => {
    let url
    let privateBlogPost, reactionlessPublicBlogPost, reactionPublicBlogPost

    beforeAll(async () => {
        url = `/users/${loginUser.username}/reactions`

        const loginUserReactions = await Reaction
            .find({ user: loginUser._id })
            .lean()
            .exec()
        const contentIds = loginUserReactions
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
        reactionlessPublicBlogPost = await BlogPost
            .findOne({
                _id: { $nin: contentIds },
                publish_date: { $exists: true },
                public_version: { $exists: false}
            })
            .lean()
            .exec()
        
        reactionPublicBlogPost = await BlogPost
            .findOne({
                _id: { $in: contentIds },
                publish_date: { $exists: true },
                public_version: { $exists: false}
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
                    .field("content-id", reactionlessPublicBlogPost._id.toString())
                    .field("content-type", 'Comment')
                    .field("reaction-type", 'Like')
                    .expect(404);
            });

            test("Pre-existing reaction", async () => {
                await request(autologinApp)
                    .post(url)
                    .set('Content-Type', "multipart/form-data")
                    .field("content-id", reactionPublicBlogPost._id.toString())
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'Like')
                    .expect(403);
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
                    .field("content-id", reactionlessPublicBlogPost._id.toString())
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
                    .field("content-id", reactionlessPublicBlogPost._id.toString())
                    .field("content-type", 'BlogPost')
                    .field("reaction-type", 'test')
                    .expect(400);
            });
        })
    })
})

// Reaction id checks done here
// Content id, reaction type, and content type checks done in above tests
describe("PUT /users/:username/reactions/:reactionId", () => {
    let urlTrunk
    let nonLoginUserReaction

    beforeAll(async () => {
        urlTrunk = `/users/${loginUser.username}/reactions/`
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
})