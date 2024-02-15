const populateDb = require("../database/populateDb")
const mongoose = require("mongoose")
const mongoConfig = require("./mongoConfigTest")
const appTest = require("./appTest")
const User = require("../../models/user")

async function loginSetup(router, routerPath, alwaysLogin = true) {
  const server = await serverSetup()
  const loginUser = await User.findOne().lean().exec()
  const autologinApp = appTest.create(router, routerPath, loginUser)

  if (!alwaysLogin) {
    const guestApp = appTest.create(router, routerPath)

    return { server, loginUser, autologinApp, guestApp }
  }

  return { server, loginUser, autologinApp }
}

async function guestSetup(router, routerPath) {
  const server = await serverSetup()
  const guestApp = appTest.create(router, routerPath)

  return { server, guestApp }
}

async function serverSetup() {
  const server = await mongoConfig.startServer()
  await populateDb.slimPopulate()

  return server
}

async function teardown(server) {
  await mongoose.connection.close()
  await mongoConfig.stopServer(server)
}

module.exports = {
  loginSetup,
  guestSetup,
  teardown,
}
