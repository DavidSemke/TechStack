const mongoose = require("mongoose")
mongoose.set("strictQuery", false)
const populateDb = require("./populateDb")
const connecter = process.env.MONGO_DB_CONNECT

async function main() {
  console.log("Debug: About to connect")
  await mongoose.connect(connecter)

  console.log("Debug: Should be connected?")
  await populateDb.populate()

  console.log("Debug: Closing mongoose")
  mongoose.connection.close()
}

main().catch((err) => console.log(err))
