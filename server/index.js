const { readFileSync } = require("fs");
const { createServer } = require("https");
const { Server } = require("socket.io");

const httpServer = createServer({

  key: readFileSync("/etc/letsencrypt/live/cards.oedel.me/privkey.pem"),
  cert: readFileSync("/etc/letsencrypt/live/cards.oedel.me/cert.pem"),
});

const io = new Server(httpServer, {
    
    cors: {
        
        origin: "https://cards.oedel.me",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

  console.log("A user has connected.");
});

console.log("Starting server...");
httpServer.listen(3000);