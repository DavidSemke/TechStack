require('dotenv').config()
const bcrypt = require('bcryptjs')
const User = require("./models/user");
const Blog = require("./models/blog");
const Comment = require("./models/comment");
const path = require('path')
const fs = require('fs')

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

async function createBlogs() {
    console.log("Adding blogs");

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

    await Promise.all([
        blogCreate(
            0, 
            { 
                title: 'Local puppies adopted!',
                thumbnail: thumbnail,
                author: users[0],
                publish_date: Date.now(),
                keywords: ['puppies'],
                content: 'Puppies adopted, everyone is happy!',
                likes: 100,
                dislikes: 0
            }
        ),
        blogCreate(
            1, 
            { 
                title: 'Thugs have cars!',
                thumbnail: thumbnail,
                author: users[1],
                publish_date: Date.now(),
                keywords: ['thugs, cars'],
                content: 'Thug cars are really loud! They must go!',
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
                author: users[2],
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
                author: users[3],
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
                author: users[1],
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
                author: users[2],
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
                author: users[0],
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
                author: users[1],
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

