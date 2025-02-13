const jwt = require("jsonwebtoken")

const protectRoute = async (req, res, next) => {
    try {
        // getting token from cookie
        const token = req.cookies.jwt
        console.log(token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" })
        }

        // verifying token
        const decoded = jwt.verify(token, process.env.JWTPASS)
        console.log(decoded)
        if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid Token" })

        next()
    } catch (error) {
        console.log("Error in protectRoute middleWare: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = protectRoute