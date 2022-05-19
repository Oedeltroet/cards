const data = {

  "games" : [

      {
          "name" : "Skip-Bo",
          "icon" : "img/thumbnails/skip-bo.png",
          "script" : "scripts/games/skip-bo.js"
      },
      
      {
          "name" : "UNO",
          "icon" : "https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg",
          "script" : "scripts/games/uno.js"
      }
  ]
};

var debug = true;
var server, io;
var rooms = {};

if (debug) {

  server = require("http").createServer();
  io = require("socket.io")(server, {});
}

else {
  
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
}

io.on("connection", (socket) => {

  console.log("A user has connected.");

  socket.on("disconnect", () => {

    console.log("A user has disconnected.");
  });

  socket.on("requestData", () => {

    console.log("Sending data.");
    socket.emit("sendData", data);
  });

  socket.on("createGame", (gameId) => {

    console.log("Creating new game.");
    console.log("You want to play " + data.games[gameId].name + "!");
  });
});

console.log("Starting server...");
server.listen(3000);