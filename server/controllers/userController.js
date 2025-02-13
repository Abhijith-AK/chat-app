const Users = require("../models/userModel")
const bcrypt = require("bcrypt") 
const generateToken = require("../lib/utils")

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body
    console.log(req.body)
    try {
        // check if user exists
        const existingUser = await Users.findOne({ email })
        if (existingUser) {
            res.status(406).json("Already existing User!! please login!")
        } else {
            // encrypting password
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(password, salt)
            const newUser = new Users({
                email, username, password: hashedPass
            })
            await newUser.save()
            generateToken.generateToken(newUser._id, res);
            res.status(201).json(newUser)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email && !password) return res.status(401).json("All Fields are required")
        const existingUser = await Users.findOne({ email })
        console.log(existingUser)
        if (!existingUser) return res.status(401).json("Invalid Credentials")
        const decryptedPassword = await bcrypt.compare(password, existingUser.password)
        if (!decryptedPassword) return res.status(401).json("Invalid Credentials")
        generateToken.generateToken(existingUser._id, res)
        res.status(200).json({
            _id: existingUser._id,
            username: existingUser.username
        })
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const usersList = await Users.find({}).select("-password")
        if (usersList) {
            res.status(200).json(usersList)
        } else {
            res.status(404).json("User List is Empty")
        }        
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}