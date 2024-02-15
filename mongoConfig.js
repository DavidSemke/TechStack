const mongoose = require("mongoose")

const connecter = process.env.MONGO_DB_CONNECT
mongoose.connect(connecter)
const db = mongoose.connection
db.on("error", console.error.bind(console, "mongo connection error"))
