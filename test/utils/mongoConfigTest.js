const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

async function startServer() {
  const mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  await mongoose.connect(mongoUri)

  mongoose.connection.on("error", (e) => {
    console.log(e)
  })

  return mongoServer
}

async function stopServer(server) {
  await server.stop()
}

module.exports = {
  startServer,
  stopServer,
}
