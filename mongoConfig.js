const mongoose = require("mongoose")

let connector = process.env.DB_CONNECTOR_DEV

if (process.env.NODE_ENV === "production") {
    connector = process.env.DB_CONNECTOR_PROD
}

mongoose.connect(connector)
const db = mongoose.connection
db.on("error", console.error.bind(console, "mongo connection error"))
