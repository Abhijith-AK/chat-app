const jwt = require("jsonwebtoken")

exports.generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWTPASS, {
        expiresIn: "7d"
    });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request frogery attacks
        secure: process.env.NODE_ENV !== "development"
    });

    return token;
}