const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("./"));
app.use(cors({
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    origin: "http://localhost:3000"
}))
const server = require("http").createServer(app);
const io = require("socket.io")(server);
let readyPlayerCount = 0;
const nameSpace = io.of("/pong");
nameSpace.on("connection", (socket) => {
    let room = Math.floor(readyPlayerCount / 2);
    socket.on("ready", () => {
        socket.join(room);
        console.log(socket.id + " is ready");
        readyPlayerCount++;
        if (readyPlayerCount % 2 === 0) {
            nameSpace.in(room).emit("startGame", socket.id);
        }
    })
    socket.on("disconnect", (reason) => {
        console.log(socket.id + " is disconnected reason : ", reason);
        readyPlayerCount--;
        socket.leave(room);
    });
    socket.on("paddleMove", (data) => {

        socket.to(room).emit("paddleMove", data);
    })
    socket.on("ballMoved", (data) => {
        socket.to(room).emit("ballMoved", data);

    })
})
server.listen(3000, () => {
    console.log("Server is running on port 3000");
})
