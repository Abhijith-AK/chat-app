const express = require("express")
const messageController = require("../controllers/messageController")
const protectRoute = require("../middlewares/auth.middleware")
const messageRouter = new express.Router()

messageRouter.post('/send', protectRoute, messageController.sendMessage)
messageRouter.post('/all', protectRoute, messageController.getAllMessages)

module.exports = messageRouter