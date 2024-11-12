const mongoose = require("mongoose")
mongoose.set("strictQuery", false)
const populateDb = require("./populateDb")
const connector = process.env.DB_CONNECTOR_DEV

async function main() {
  console.log("Debug: About to connect")
  await mongoose.connect(connector)

  console.log("Debug: Should be connected?")
  await populateDb.populate()

  console.log("Debug: Closing mongoose")
  mongoose.connection.close()
}

main().catch((err) => console.log(err))
