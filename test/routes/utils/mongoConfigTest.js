const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function startServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  mongoose.connection.on("error", e => {
    if (e.message.code === "ETIMEDOUT") {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });

  return mongoServer
}

async function stopServer(server) {
  await server.stop()
}

module.exports = {
  startServer,
  stopServer
};