const mongoose = require("mongoose")
const DBURL = process.env.DBCONNECTIONSTRING


mongoose.connect(DBURL).then(res => {
    console.log("MongoDB connected")
}).catch(err => {
    console.log("MongoDB connection failed")
    console.error(err)
})