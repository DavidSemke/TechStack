require('dotenv').config()
const User = require("./models/user");
const Blog = require("./models/blog");
const Comment = require("./models/comment");

const users = [];
const blogs = [];
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
    await createBlogs()
    await createComments()
    await createReplies()

    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

async function userCreate(index, userData) {
    const user = new User(userData);
    await user.save();
    users[index] = user;
}

async function blogCreate(index, blogData) {
    const blog = new Blog(blogData);
    await blog.save();
    blogs[index] = blog;
}

async function commentCreate(index, commentData) {
    const comment = new Comment(commentData);
    await comment.save();
    comments[index] = comment;
}

async function addReply(replyData) {
    const reply = new Comment(replyData)
    await reply.save()
}

async function createUsers() {
    console.log("Adding users");
    await Promise.all([
        userCreate(0, { username: 'dad', password: 'dad' }),
        userCreate(1, { username: 'mom', password: 'mom' }),
        userCreate(2, { username: 'ted', password: 'ted' }),
        userCreate(3, { username: 'ava', password: 'ava' }),
    ]);
}

async function createBlogs() {
console.log("Adding blogs");
await Promise.all([
    blogCreate(
        0, 
        { 
            title: 'Local puppies adopted!',
            author: {name: 'dad'},
            publish_date: Date.now(),
            keywords: ['puppies'],
            content: ['Puppies adopted, everyone is happy!'],
            likes: 100,
            dislikes: 0
        }
    ),
    blogCreate(
        1, 
        { 
            title: 'Thugs have cars!',
            author: {name: 'mom'},
            publish_date: Date.now(),
            keywords: ['thugs, cars'],
            content: ['Thug cars are really loud! They must go!'],
            likes: 10,
            dislikes: 5
        }
    ),
]);
}

async function createComments() {
    console.log("Adding comments");
    await Promise.all([
        commentCreate(
            0,
            {
                author: {name: 'ted'},
                blog: blogs[0],
                publish_date: Date.now(),
                content: 'Yay puppies!',
                likes: 5,
                dislikes: 0
            }
        ),
        commentCreate(
            1,
            {
                author: {name: 'ava'},
                blog: blogs[0],
                publish_date: Date.now(),
                content: 'Everyone loves puppies!',
                likes: 10,
                dislikes: 0
            }
        ),
        commentCreate(
            2,
            {
                author: {name: 'ned'},
                blog: blogs[1],
                publish_date: Date.now(),
                content: 'I am a thug and I am keeping my car!',
                likes: 5,
                dislikes: 10
            }
        ),
        commentCreate(
            3,
            {
                author: {name: 'ava'},
                blog: blogs[1],
                publish_date: Date.now(),
                content: 'Thugs be tripping.',
                likes: 10,
                dislikes: 5
            }
        )
    ]);
}

async function createReplies() {
    console.log("Adding replies");
    await Promise.all([
        addReply(
            {
                author: {name: 'dad'},
                blog: blogs[0],
                publish_date: Date.now(),
                content: 'Puppies!',
                likes: 0,
                dislikes: 1,
                reply_to: comments[0]
            }
        ),
        addReply(
            {
                author: {name: 'mom'},
                blog: blogs[1],
                publish_date: Date.now(),
                content: 'I will become mayor and take your car!',
                likes: 1,
                dislikes: 0,
                reply_to: comments[2]
            }
        )
    ])
}

