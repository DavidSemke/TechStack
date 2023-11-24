const controller = require('../controllers/login')
const express = require("express")
const router = express.Router()

module.exports = function(passport) {
  
  router.get("/", controller.getLogin)
  
  router.post('/', controller.postLogin);

  return router
}
