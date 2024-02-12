const request = require("supertest");
const BlogPost = require("../../../models/blogPost");
const Comment = require("../../../models/comment");
const setupTeardown = require('../../utils/setupTeardown')
const blogPostsRouter = require("../../../routes/blogPosts")

let server, app
let publicBlogPost, privateBlogPost, comment, reply

// No updates/deletes target database, so no need for beforeEach
beforeAll(async () => {
  const setup = await setupTeardown.guestSetup(
    blogPostsRouter, 
    '/blog-posts'
  )
  server = setup.server
  app = setup.guestApp

  // There should be at least one comment and one reply
  comment = await Comment
    .findOne({
      reply_to: { $exists: false }
    })
    .lean()
    .exec()
  reply = await Comment
    .findOne({
      reply_to: { $exists: true }
    })
    .lean()
    .exec()
  publicBlogPost = await BlogPost
    .findOne({
      public_version: { $exists: false },
      publish_date: { $exists: true}
    })
    .lean()
    .exec()
  privateBlogPost = await BlogPost
    .findOne({
      $or: [
        { public_version: { $exists: true } },
        { publish_date: { $exists: false} }
      ]
    })
    .lean()
    .exec()
})

afterAll(async () => {
  await setupTeardown.teardown(server)
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