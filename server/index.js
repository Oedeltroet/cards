const data = {

  "games" : [

    {
      "name" : "Skip-Bo",
      "icon" : "img/thumbnails/skip-bo.png",
      "script" : "skip-bo.js"
    },
    
    {
      "name" : "UNO",
      "icon" : "https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg",
      "script" : "uno.js"
    }
  ],

  "decks" : [

    {
      "name" : "Poker",
      "styles" : [
        
        {
          "name" : "English Pattern",
          "author" : "Dmitry Fomin",
          "image" : "english_pattern.svg",
          "stylesheet" : "english_pattern.css"
        },

        {
          "name" : "SVG Cards",
          "author" : "David Bellot",
          "image" : "svg-cards.svg",
          "stylesheet" : "svg-cards.css"
        }
      ],
      "suits" : [

        "clubs", "hearts", "diamonds", "spades"
      ],
      "values" : [

        "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"
      ]
    },

    {
      "name" : "Skip-Bo",
      "styles" : [],
      "suits" : [],
      "values" : [

        "J", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
      ]
    }
  ],
};

var debug = true;
var server, io;

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
let games = new Map();
let players;
let numPlayers;

io.on("connection", (socket) => {

  console.log("A user has connected.");

  let currentRoomName = "";
  numPlayers = 0;

  socket.on("disconnect", () => {

    console.log("A user has disconnected.");
  });

  socket.on("REQUEST_DATA", () => {

    socket.emit("SEND_DATA", data);
  });
  
  socket.on("CREATE_GAME", (gameId) => {

    console.log("Creating new " + data.games[gameId].name + " game.");

    var roomName = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 5; i++) {

      roomName += chars[Math.floor(Math.random() * chars.length)];
    }

    socket.join(roomName);

    currentRoomName = roomName;
    numPlayers = io.sockets.adapter.rooms.get(roomName).size;
    
    socket.emit("GAME_CREATED", roomName);
    socket.emit("BECOME_LEADER");

    console.log(rooms);
  });

  socket.on("JOIN_GAME", (roomName) => {

    if (io.sockets.adapter.rooms.has(roomName)) {

      currentRoomName = roomName;

      socket.join(roomName);
      socket.emit("JOIN_SUCCESSFUL", roomName);
      console.log("A user joined room " + roomName);

      numPlayers = io.sockets.adapter.rooms.get(roomName).size;

      if (numPlayers >= 2 && numPlayers <= 6) {

        console.log("The game is ready (" + numPlayers + " players)");
        io.to(roomName).emit("GAME_READY", numPlayers);
      }

      else if (numPlayers > 6) {

        console.log("Too many players!");
        io.to(roomName).emit("TOO_MANY_PLAYERS", numPlayers);
      }
    }

    else {

      socket.emit("JOIN_FAILED_ROOM_NOT_FOUND", roomName);
    }
  });

  socket.on("disconnect", () => {

    if (io.sockets.adapter.rooms.has(currentRoomName)) {

      numPlayers = io.sockets.adapter.rooms.get(currentRoomName).size;

      if (numPlayers >= 2 && numPlayers <= 6) {

        console.log("The game is ready (" + numPlayers + " players)");
        io.to(currentRoomName).emit("GAME_READY", numPlayers);
      }

      else if (numPlayers > 6) {

        console.log("Too many players!");
        io.to(currentRoomName).emit("TOO_MANY_PLAYERS", numPlayers);
      }

      else if (numPlayers < 2) {

        console.log("Not enough players!");
        io.to(currentRoomName).emit("NOT_ENOUGH_PLAYERS", numPlayers);
      }
    }
  });

  let game;

  socket.on("START_GAME", (gameId, roomName) => {

    let gameLogic;
    let playWithPokerDecks = true;
    
    players = io.sockets.adapter.rooms.get(currentRoomName);
    numPlayers = players.size;

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        gameLogic = require("./scripts/games/" + data.games[gameId].script);
        games.set(roomName, new gameLogic.Gamestate(numPlayers, playWithPokerDecks));
        game = games.get(roomName);
        console.log(game);

        io.to(roomName).emit("GAME_STARTED", numPlayers, playWithPokerDecks ? data.decks[0] : data.decks[1], 1);

        break;

      default: break;
    }
  });

  socket.on("LETS_PLAY", (gameId, roomName) => {

    let playerId = 0;

    console.log(socket.id);

    for (let i = 0; i < players.size; i++) {

      console.log([...players][i]);

      if ([...players][i] === socket.id) {

        playerId = i;
        break;
      }
    }

    socket.emit("ASSIGN_PLAYER_ID", playerId);

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        game = games.get(roomName);

        let stockPile = game.playerCards[playerId][0];
        console.log("Stock pile for player " + playerId + ", top card is " + data.decks[0].values[stockPile.topCard.value] + " of " + data.decks[0].suits[stockPile.topCard.suit]);
        io.to(roomName).emit("UPDATE_STOCK_PILE", playerId, stockPile.size, stockPile.topCard.suit, stockPile.topCard.value);

        break;

      default: break;
    }
  });
});

console.log("Starting server...");
server.listen(3000);