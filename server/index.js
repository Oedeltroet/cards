const data = {

  "games" : [

    {
      "name" : "Skip-Bo",
      "icon" : "img/thumbnails/skip-bo.png",
      "script" : "skip-bo.js"
    },
    
    // {
    //   "name" : "UNO",
    //   "icon" : "https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg",
    //   "script" : "uno.js"
    // }
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
let pickPile;

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

    for (let i = 0; i < numPlayers; i++) {

      if ([...players][i] == socket.id) {

        socket.emit("ASSIGN_PLAYER_ID", i);
      }

      else {

        socket.to([...players][i]).emit("ASSIGN_PLAYER_ID", i);
      }
    }

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        gameLogic = require("./scripts/games/" + data.games[gameId].script);
        games.set(roomName, new gameLogic.Gamestate(numPlayers, playWithPokerDecks));
        game = games.get(roomName);

        io.to(roomName).emit("GAME_STARTED", numPlayers, playWithPokerDecks ? data.decks[0] : data.decks[1], 1);
        io.to(roomName).emit("TURN", game.playerTurn);

        break;

      default: break;
    }
  });

  socket.on("LETS_PLAY", (playerId, gameId, roomName) => {

    console.log("Player " + playerId + " is ready to play.");

    switch (gameId) {

      case 0:

        /* SKIP-BO */

        do { game = games.get(roomName); }
        while (!game);

        let stockPile = game.playerCards[playerId][0];
        console.log("Player " + playerId + ": stock pile top card is " + data.decks[0].values[stockPile.topCard.value] + " of " + data.decks[0].suits[stockPile.topCard.suit]);
        io.to(roomName).emit("UPDATE_STOCK_PILE", playerId, stockPile.size, stockPile.topCard.suit, stockPile.topCard.value);

        socket.on("DRAW", () => {

          if (game.playerTurn == playerId) {

            game.drawHand(playerId);

            let handCards = game.playerCards[playerId][1];
            let arr = [];

            for (let i = 0; i < handCards.length; i++) {

              arr.push(handCards[i].data);
            }

            socket.emit("UPDATE_HAND", handCards.length, arr);
          }
        });

        socket.on("TRANSFER", (originPile, targetPile) => {

          if (game.transfer(originPile, targetPile)) {

            // from stock pile
            if (originPile == 0) {

              // ... TODO
            }

            // from discard pile
            else if (originPile <= 4) {

              let discardPile = game.playerCards[playerId][(originPile - 1) + 2];

              if (discardPile.size == 0) {

                io.to(roomName).emit("UPDATE_DISCARD_PILE", playerId, originPile - 1, discardPile.size);
              }

              else {

                io.to(roomName).emit("UPDATE_DISCARD_PILE", playerId, originPile - 1, discardPile.size, discardPile.topCard.suit, discardPile.topCard.value);
              }
            }

            // from hand cards
            else {

              let handCards = game.playerCards[playerId][1];
              let arr = [];

              for (let i = 0; i < handCards.length; i++) {

                arr.push(handCards[i].data);
              }

              socket.emit("UPDATE_HAND", handCards.length, arr);
            }

            // to discard pile (ends the turn)
            if (targetPile >= 4) {

              let discardPile = game.playerCards[playerId][targetPile - 2];

              // if (discardPile.size == 0) {

              //   io.to(roomName).emit("UPDATE_DISCARD_PILE", playerId, targetPile - 4, discardPile.size);
              // }

              // else {

                io.to(roomName).emit("UPDATE_DISCARD_PILE", playerId, targetPile - 4, discardPile.size, discardPile.topCard.suit, discardPile.topCard.value);
              // }

              game.nextTurn();

              // very ugly code, but i haven't come up with a better solution yet
              io.to(roomName).emit("TURN", game.playerTurn);
              io.to(roomName).emit("TURN", game.playerTurn);
              io.to(roomName).emit("TURN", game.playerTurn);
            }

            // to build pile
            else {

              let buildPile = game.buildPiles[targetPile];

              if (buildPile.size == 0) {

                io.to(roomName).emit("UPDATE_BUILD_PILE", targetPile, buildPile.size);
              }

              else {

                io.to(roomName).emit("UPDATE_BUILD_PILE", targetPile, buildPile.size, buildPile.topCard.suit, buildPile.topCard.value);
              }
            }
          }

          else {

            socket.emit("NOT_ALLOWED");
          }
        });

        break;

      default: break;
    }
  });
});

console.log("Starting server...");
server.listen(3000);