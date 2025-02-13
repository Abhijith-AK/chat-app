const express = require("express")
const userController = require("../controllers/userController")
const protectRoute = require("../middlewares/auth.middleware")

const userRouter = new express.Router()

userRouter.post("/register", userController.registerUser)
userRouter.post("/login", userController.loginUser)
userRouter.get("/users", protectRoute, userController.getAllUsers)

module.exports = userRouter