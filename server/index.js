require("dotenv").config()
const express = require("express")
const http = require("http")
const socket = require("socket.io")
const cors = require("cors")
const userRouter = require("./routes/userRoute")
const messageRouter = require("./routes/messageRoute")
require("./database/dbConnection")
const cookieParser = require("cookie-parser")

const app = express()
const server = http.createServer(app)


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())

const io = new socket.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const onlineUsers = new Map()

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online`);
        io.emit("online", Array.from(onlineUsers.keys()));
    });

    socket.on("send", ({ senderId, recieverId, message }) => {
        const receiverSocketId = onlineUsers.get(recieverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive", { senderId, message });
        }
    });
    
    socket.on("start-call", ({ offer, to, from }) => {
        const recipientSocket = onlineUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit("incoming-call", { from, signal: offer });
        }
    });

    socket.on("answer", ({ answer, to, from }) => {
        const callerSocket = onlineUsers.get(to);
        const fromSocket = onlineUsers.get(from);
        if (callerSocket) {
            io.to(callerSocket, fromSocket).emit("call-accepted", answer);
        }
    });

    socket.on("ice-candidate", (candidate, to) => {
        const recipientSocket = onlineUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit("ice-candidate", candidate);
        }
    });

    socket.on("end-call", ({to, from}) => {
        const recipientSocket = onlineUsers.get(to);
        const recipientSocket2 = onlineUsers.get(from);
        if (recipientSocket) {
            io.to(recipientSocket, recipientSocket2).emit("call-ended");
        }
    });

    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit("online", Array.from(onlineUsers.keys()));
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

app.use(express.json())

app.use("/api", userRouter, messageRouter)


server.listen(5000, () => {
    console.log("Server started and running")
})
