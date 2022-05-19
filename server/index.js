const { readFileSync } = require("fs");
const { createServer } = require("https");
const { Server } = require("socket.io");
var options = {};

if (process.platform != "win32") {

  options = {

    key: readFileSync("/etc/letsencrypt/live/cards.oedel.me/privkey.pem"),
    cert: readFileSync("/etc/letsencrypt/live/cards.oedel.me/cert.pem"),
  }
}

server = createServer(options);
io = new Server(server, {
  
  cors: {
      
      origin: "https://cards.oedel.me",
      methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {

  console.log("A user has connected.");
});

// io.on("createGame", (socket) => {

//   console.log("Creating new game.");
// });

console.log("Starting server...");
server.listen(3000);