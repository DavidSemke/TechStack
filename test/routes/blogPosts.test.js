const request = require("supertest");
const BlogPost = require("../../models/blogPost");
const Comment = require("../../models/comment");
const populate = require('../database/populateDb')
const mongoose = require('mongoose')
const mongoConfig = require('./utils/mongoConfigTest')
const appTest = require('./utils/appTest')
const blogPostsRouter = require("../../routes/blogPosts")

let server, app, publicBlogPost, comment

// No updates/deletes target database, so no need for beforeEach
beforeAll(async () => {
  app = appTest.create(blogPostsRouter, '/blog-posts')
  server = await mongoConfig.startServer()
  await populate()
  
  publicBlogPost = await BlogPost
    .findOne({
      publish_date: { $exists: true },
      public_version: { $exists: false}
    })
    .lean()
    .exec()
  privateBlogPost = await BlogPost
    .findOne({
      public_version: { $exists: true}
    })
    .lean()
    .exec()
  comment = await Comment
    .findOne({
      blog_post: publicBlogPost._id,
      reply_to: { $exists: false }
    })
    .lean()
    .exec()
  reply = await Comment
    .findOne({
      blog_post: publicBlogPost._id,
      reply_to: { $exists: true }
    })
    .lean()
    .exec()
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongoConfig.stopServer(server)
})

describe("GET /blog-posts", () => {
  test("Without keywords", async () => {
    await request(app)
      .get("/blog-posts")
      .expect("Content-Type", /html/)
      .expect(400);
  });

  test("With keywords", async () => {
    const res = await request(app)
      .get("/blog-posts?keywords=bully,not")
      .expect("Content-Type", /json/)
      .expect(200);
  
    expect(res.body).toHaveProperty('renderedHTML')
  });
})

describe("GET /blog-posts/:blogPostId", () => {
  describe('Invalid blogPostId', () => {
    test("Non-existent blog post", async () => {
      await request(app)
        .get(`/blog-posts/000011112222333344445555`)
        .expect("Content-Type", /html/)
        .expect(404);
    });
  
    test("Private blog post", async () => {
      await request(app)
        .get(`/blog-posts/${privateBlogPost._id}`)
        .expect("Content-Type", /html/)
        .expect(403);
    });
  
    test("Invalid ObjectId", async () => {
      await request(app)
        .get(`/blog-posts/test`)
        .expect("Content-Type", /html/)
        .expect(400);
    });
  })
  
  test("Get", async () => {
    await request(app)
      .get(`/blog-posts/${publicBlogPost._id}`)
      .expect("Content-Type", /html/)
      .expect(200)
  });
})

// No need to check blogPostId again; path secure if previous tests pass
describe("POST /blog-posts/:blogPostId/comments", () => {
  let url
  
  beforeAll(() => {
    url = `/blog-posts/${publicBlogPost._id}/comments`
  })

  test("Valid comment", async () => {
    const res = await request(app)
      .post(url)
      .set('Content-Type', "multipart/form-data")
      .field("content", "content")
      .field("reply-to", comment._id.toString())
      .expect("Content-Type", /json/)
      .expect(200)
    
    expect(res.body).toHaveProperty('renderedHTML')
    expect(res.body).toHaveProperty('commentData')
  });

  test("Valid comment, reply to reply", async () => {
    await request(app)
      .post(url)
      .set('Content-Type', "multipart/form-data")
      .field("content", "content")
      .field("reply-to", reply._id.toString())
      .expect("Content-Type", /html/)
      .expect(400)
  });

  test("Invalid comment, empty content", async () => {
    const res = await request(app)
      .post(url)
      .set('Content-Type', "multipart/form-data")
      .field("content", "")
      .expect("Content-Type", /json/)
      .expect(400)
    
    expect(res.body).toHaveProperty('errors')
  });
})