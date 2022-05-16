const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {

    cors: {

        origin: "http://127.0.0.1:5500"
    }
});

io.on('connection', (socket) => {

    console.log('a user connected');
});

server.listen(3000, () => {

    console.log('listening on *:3000');
});