const blogPostsRouter = require("../../routes/blogPosts")
const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/blog-posts", blogPostsRouter);

test("Path '/'", done => {
  request(app)
    .get("/?keywords=puppies,local")
    .expect("Content-Type", /json/)
    .expect(200, done);
});

test("Path '/:blogPostId'", done => {
  request(app)
    .post("/test")
    .type("form")
    .send({ item: "hey" })
    .then(() => {
      request(app)
        .get("/test")
        .expect({ array: ["hey"] }, done);
    });
});

test("Path '/:blogPostId/comments'", done => {
    request(app)
      .post("/test")
      .type("form")
      .send({ item: "hey" })
      .then(() => {
        request(app)
          .get("/test")
          .expect({ array: ["hey"] }, done);
      });
  });