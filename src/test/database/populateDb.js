require("dotenv").config()
const bcrypt = require("bcryptjs")
const User = require("../../models/user")
const BlogPost = require("../../models/blogPost")
const Comment = require("../../models/comment")
const ReactionCounter = require("../../models/reactionCounter")
const Reaction = require("../../models/reaction")
const fileData = require("./documents/fileData")
const userData = require("./documents/userData")
const blogPostData = require("./documents/blogPostData")
const commentData = require("./documents/commentData")

const users = []
const blogPosts = []
const comments = []
const reactionCounters = []

async function populate() {
  const { contents, imageData } = await fileData.getData()

  const userDocs = userData.getData(imageData)
  await createUsers(userDocs)

  const blogPostDocs = blogPostData.getData(users, contents, imageData)
  await createBlogPosts(blogPostDocs, 6, 10, 6)

  const commentDocs = commentData.getData(users)
  await createComments(commentDocs, 2, 2)

  await createReactionCounters()
  await createReactions()
}

async function slimPopulate() {
  const { contents, imageData } = await fileData.getData(6)

  const userDocs = userData.getData(imageData, 2)
  await createUsers(userDocs)

  const blogPostDocs = blogPostData.getData(users, contents, imageData)
  await createBlogPosts(blogPostDocs, 2, 4, 2, true)

  const commentDocs = commentData.getData(users, 2)
  await createComments(commentDocs, 1, 1)

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
        profile_pic: userData.profile_pic,
      })

      await user.save()
      users[index] = user
      resolve(user)
    })
  })
}

async function blogPostCreate(index, blogPostData) {
  const blogPost = new BlogPost(blogPostData)
  await blogPost.save()
  blogPosts[index] = blogPost
}

async function commentCreate(index, commentData) {
  const comment = new Comment(commentData)
  await comment.save()
  comments[index] = comment
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

async function createUsers(userData) {
  await Promise.all(
    userData.map((data, index) => {
      return userCreate(index, data)
    }),
  )
}

// It is assumed that blog posts, outside of a blog post private-public pair,
// have collectively unique values
// If allUnique is true, blog posts within a private-public pair also have
// collectively unique values
async function createBlogPosts(
  blogPostData,
  publicCount,
  privateCount,
  pairCount,
  allUnique = false,
) {
  if (publicCount < pairCount || privateCount < pairCount) {
    throw new Error("'Pair count' requirement impossible")
  }

  // These are indexes defining where in the blogPostData list to start
  // and stop making private blog posts
  let privateStart = 0
  let privateEnd = privateCount

  if (allUnique) {
    const blogPostCount = publicCount + privateCount

    if (blogPostCount > blogPostData.length) {
      throw new Error("'All unique' requirement impossible")
    }

    privateStart = publicCount
    privateEnd = blogPostCount
  } else if (Math.max(publicCount, privateCount) > blogPostData.length) {
    throw new Error("Count requirements impossible")
  }

  // Public versions
  await Promise.all(
    blogPostData.slice(0, publicCount).map((data, index) => {
      data.publish_date = Date.now()
      return blogPostCreate(index, data)
    }),
  )
  // Private versions
  await Promise.all(
    blogPostData.slice(privateStart, privateEnd).map((data, index) => {
      const blogPost = blogPosts[index]

      if (blogPost && index < pairCount) {
        data.publish_date = Date.now()
        data.public_version = blogPosts[index]
      }

      return blogPostCreate(index + publicCount, data)
    }),
  )
}

// blogPostCount is the number of public blog posts that require a comment
// replyCount is the number of required replies
// All comments have collectively unique values
async function createComments(commentData, blogPostCount, replyCount) {
  if (blogPostCount > commentData.length) {
    throw new Error("'blogPostCount' requirement impossible")
  }

  if (replyCount >= commentData.length) {
    throw new Error("'replyCount' requirement impossible")
  }

  const publicBlogPosts = blogPosts.filter((post) => {
    return !post.public_version && post.publish_date
  })

  // comments can only reference a public blog post
  if (blogPostCount > publicBlogPosts.length) {
    throw new Error("'blogPostCount' requirement impossible")
  }

  const replyStart = commentData.length - replyCount

  // create non-replies
  await Promise.all(
    commentData.slice(0, replyStart).map((data, index) => {
      data.blog_post = publicBlogPosts[index % blogPostCount]

      return commentCreate(index, data)
    }),
  )

  // create replies
  await Promise.all(
    commentData.slice(replyStart, commentData.length).map((data, index) => {
      const replyTo = comments[index % comments.length]
      data.reply_to = replyTo
      data.blog_post = replyTo.blog_post

      return commentCreate(index + replyStart, data)
    }),
  )
}

async function createReactionCounters() {
  const reactionCounters = []
  // only public blog posts should have reaction counters
  const publicBlogPosts = blogPosts.filter((post) => {
    return !post.public_version && post.publish_date
  })

  const postGroups = [
    {
      type: "BlogPost",
      collection: publicBlogPosts,
    },
    {
      type: "Comment",
      collection: comments,
    },
  ]

  // The order of combns is important for testing
  // This is because the tests have these requirements:
  // 1 - A blog post and comment must be reacted to by loginUser
  // 2 - A blog post and comment must be NOT reacted to by loginUser
  // As long as only two users are needed for testing, this ordering
  // guarantees requirement satisfaction (assuming users are assigned to
  // reactions one after another in increments of 1)
  const combns = [
    [0, 0],
    [1, 1],
    [0, 1],
    [1, 0],
  ]
  let combnIndex = 0

  for (const postGroup of postGroups) {
    const { type: postType, collection: posts } = postGroup

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const [likeCount, dislikeCount] = combns[combnIndex % combns.length]

      reactionCounters.push({
        content: {
          content_type: postType,
          content_id: post,
        },
        like_count: likeCount,
        dislike_count: dislikeCount,
      })

      combnIndex++
    }
  }

  await Promise.all(
    reactionCounters.map((reactionCounter, index) => {
      return reactionCounterCreate(index, reactionCounter)
    }),
  )
}

async function createReactions() {
  const reactions = []
  // only public blog posts should have reactions
  const publicBlogPosts = blogPosts.filter((post) => {
    return !post.public_version && post.publish_date
  })

  const postGroups = [
    {
      type: "BlogPost",
      collection: publicBlogPosts,
    },
    {
      type: "Comment",
      collection: comments,
    },
  ]
  let userIndex = 0
  let reactionCounterIndex = 0

  for (const postGroup of postGroups) {
    const { type: postType, collection: posts } = postGroup

    for (const post of posts) {
      const reactionCounter = reactionCounters[reactionCounterIndex++]
      const likeCount = reactionCounter.like_count
      const dislikeCount = reactionCounter.dislike_count
      const reactionGroups = [
        {
          reactionType: "Like",
          count: likeCount,
        },
        {
          reactionType: "Dislike",
          count: dislikeCount,
        },
      ]

      for (const reactionGroup of reactionGroups) {
        const { reactionType, count } = reactionGroup

        for (let i = 0; i < count; i++) {
          reactions.push({
            user: users[userIndex % users.length],
            content: {
              content_type: postType,
              content_id: post,
            },
            reaction_type: reactionType,
          })

          userIndex++
        }
      }
    }
  }

  await Promise.all(reactions.map((reaction) => reactionCreate(reaction)))
}

module.exports = {
  populate,
  slimPopulate,
}
