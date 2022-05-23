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
var games;

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

const rooms = io.of("/").adapter.rooms;

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

    console.log("Creating new " + data.games[gameId].name + " game.");

    var roomName = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 5; i++) {

      roomName += chars[Math.floor(Math.random() * chars.length)];
    }

    socket.join(roomName);
    socket.emit("gameCreated", roomName);
    socket.emit("becomeLeader");

    console.log(rooms);
  });

  socket.on("joinGame", (roomName) => {

    socket.join(roomName);
    socket.emit("successfullyJoined", roomName);

    if (io.sockets.adapter.rooms.get(roomName).size >= 2) {

      console.log("The game is ready.");
      io.to(roomName).emit("gameReady");
    }

    console.log(rooms);
  });

  socket.on("startGame", (gameId, roomName) => {

    let numPlayers = io.sockets.adapter.rooms.get(roomName).size;

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        var SkipBo = require("./" + data.games[gameId].script);
        var game = new SkipBo.Gamestate(numPlayers, true);

        console.log(game);

        break;

      default: break;
    }

    io.to(roomName).emit("gameStarted");
  });

  socket.on("letsPlay", (gameId) => {

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        var SkipBo = require("./" + data.games[gameId].script);

        break;

      default: break;
    }
  });
});

console.log("Starting server...");
server.listen(3000);