function init(socket, gameId) {

    document.body.innerHTML = "";

    var buttonCreateGame = document.createElement("button");
    buttonCreateGame.id = "button-create";
    buttonCreateGame.innerText = "Create";

    buttonCreateGame.onclick = function() {

        socket.emit("CREATE_GAME", gameId);
    };

    var inputJoinGame = document.createElement("input");
    inputJoinGame.id = "input-join";
    inputJoinGame.maxLength = 5;

    var buttonJoinGame = document.createElement("button");
    buttonJoinGame.id = "button-join";
    buttonJoinGame.innerText = "Join";

    var joinGame = document.createElement("form");
    joinGame.appendChild(inputJoinGame);
    joinGame.appendChild(buttonJoinGame);

    joinGame.addEventListener("submit", (e) => {

        e.preventDefault();

        if (inputJoinGame.value) {

            statusBar.innerText = "Sending join request...";
            socket.emit("JOIN_GAME", inputJoinGame.value);
        }
    });

    var statusBar = document.createElement("p");
    statusBar.id = "status";

    var menuContainer = document.createElement("div");
    menuContainer.id = "menu";
    menuContainer.appendChild(buttonCreateGame);
    menuContainer.appendChild(joinGame);
    menuContainer.appendChild(statusBar);

    document.body.appendChild(menuContainer);

    socket.on("GAME_CREATED", (roomName) => {

        statusBar.innerText = "Joining...";
        openLobby(socket, gameId, roomName);
    });

    socket.on("JOIN_SUCCESSFUL", (roomName) => {

        statusBar.innerText = "Joining...";
        openLobby(socket, gameId, roomName);
    });

    socket.on("JOIN_FAILED_ROOM_NOT_FOUND", (roomName) => {

        statusBar.innerText = "A room with this code does not exist.";
    });
};

function openLobby(socket, gameId, roomName) {

    let statusBar = document.createElement("p");
    statusBar.id = "status";
    statusBar.innerText = "Welcome to the lobby!";

    let lobbyCode = document.createElement("p");
    lobbyCode.innerText = roomName;

    let lobbyContainer = document.createElement("div");
    lobbyContainer.id = "lobby";
    lobbyContainer.appendChild(statusBar);
    lobbyContainer.appendChild(lobbyCode);

    document.body.innerHTML = "";
    document.body.appendChild(lobbyContainer);
    

    socket.on("BECOME_LEADER", () => {

        var buttonStartGame = document.createElement("button");
        buttonStartGame.innerText = "Start";
        buttonStartGame.disabled = true;
        buttonStartGame.onclick = () => {

            socket.emit("START_GAME", gameId, roomName);
        };

        lobbyContainer.appendChild(buttonStartGame);

        socket.on("GAME_READY", (numPlayers) => {

            statusBar.innerText = "The game is ready. (" + numPlayers + " players)";
            buttonStartGame.disabled = false;
        });

        socket.on("TOO_MANY_PLAYERS", (numPlayers) => {

            statusBar.innerText = "Too many players! (" + numPlayers + ")";
            buttonStartGame.disabled = true;
        });

        socket.on("NOT_ENOUGH_PLAYERS", (numPlayers) => {

            statusBar.innerText = "Not enough players! (" + numPlayers + ")";
            buttonStartGame.disabled = true;
        });
    });

    socket.on("GAME_STARTED", (players, deck, deckStyle) => {

        console.log("The game has started.")
        game(socket, gameId, players, deck, deckStyle);
    });
}

function game(socket, gameId, players, deck, deckStyle) {

    let myId = 0;

    document.body.innerHTML = "";

        /* LOAD CSS FILE FOR THE CARD DECK */

    let stylesheetPath = "styles/decks/" + deck.styles[deckStyle].stylesheet;
    let stylesheetAlreadyLoaded = false;
    let stylesheetsList = document.head.getElementsByClassName("style-deck");
    
    for (let element of stylesheetsList) {
        
        if (element.getAttribute("href") === stylesheetPath) {

            stylesheetAlreadyLoaded = true;
        }
    }

    if (!stylesheetAlreadyLoaded) {

        let stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.className = "style-deck";
        stylesheet.href = stylesheetPath;

        this.document.head.appendChild(stylesheet);
    }

        /* CREATE THE PILES */

    let imagePath = "img/decks/" + deck.styles[deckStyle].image;

    // draw pile
    let drawPileTopCard = document.createElement("div");
    drawPileTopCard.className = "spades 7"; // change to "hidden"
    drawPileTopCard.appendChild(document.createElement("img")).src = imagePath;
    let drawPile = document.createElement("div");
    drawPile.className = "card";
    drawPile.appendChild(drawPileTopCard);
    let drawPileAmount = document.createElement("p");
    drawPileAmount.innerText = "Draw Pile";
    let drawPileContainer = document.createElement("div");
    drawPileContainer.className = "pile";
    drawPileContainer.appendChild(drawPile);
    drawPileContainer.appendChild(drawPileAmount);

    // build piles
    let buildLayout = document.createElement("div");
    buildLayout.className = "build-layout";
    buildLayout.style.display = "grid";
    buildLayout.style.gridTemplateColumns = "repeat(auto-fit, minmax(min(100%/3, max(120px, 100%/5)), 1fr))";
    buildLayout.style.justifyContent = "center";
    buildLayout.style.alignItems = "center";

    let buildPiles = Array(4);

    for (let i = 0; i < 4; i++) {

        let buildPileTopCard = document.createElement("div");
        buildPileTopCard.className = "empty";
        buildPileTopCard.appendChild(document.createElement("img")).src = imagePath;
        let buildPile = document.createElement("div");
        buildPile.className = "card";
        buildPile.appendChild(buildPileTopCard);
        let buildPileAmount = document.createElement("p");
        buildPileAmount.innerText = "Build Pile " + (i + 1);

        buildPiles[i] = document.createElement("div");
        buildPiles[i].className = "pile";
        buildPiles[i].appendChild(buildPile);
        buildPiles[i].appendChild(buildPileAmount);

        buildLayout.appendChild(buildPiles[i]);
    }

    // own stock pile
    let stockPileTopCard = document.createElement("div");
    stockPileTopCard.className = "diamonds Q"; // change to "hidden"
    stockPileTopCard.appendChild(document.createElement("img")).src = imagePath;
    let stockPile = document.createElement("div");
    stockPile.className = "card";
    stockPile.appendChild(stockPileTopCard);
    let stockPileAmount = document.createElement("p");
    stockPileAmount.innerText = "Stock Pile (30)";
    let stockPileContainer = document.createElement("div");
    stockPileContainer.className = "pile";
    stockPileContainer.appendChild(stockPile);
    stockPileContainer.appendChild(stockPileAmount);

    // own discard piles
    let discardLayout = document.createElement("div");
    discardLayout.className = "discard-layout";
    discardLayout.style.display = "grid";
    discardLayout.style.gridTemplateColumns = "repeat(auto-fit, minmax(min(100%/3, max(120px, 100%/5)), 1fr))";
    discardLayout.style.justifyContent = "center";
    discardLayout.style.alignItems = "center";

    let discardPiles = Array(4);

    for (let i = 0; i < 4; i++) {

        let discardPileTopCard = document.createElement("div");
        discardPileTopCard.className = "empty";
        discardPileTopCard.appendChild(document.createElement("img")).src = imagePath;
        let discardPile = document.createElement("div");
        discardPile.className = "card";
        discardPile.appendChild(discardPileTopCard);
        let discardPileAmount = document.createElement("p");
        discardPileAmount.innerText = "Discard Pile " + (i + 1);

        discardPiles[i] = document.createElement("div");
        discardPiles[i].className = "pile";
        discardPiles[i].appendChild(discardPile);
        discardPiles[i].appendChild(discardPileAmount);

        discardLayout.appendChild(discardPiles[i]);
    }

    // player hand

    let handLayout = document.createElement("div");
    handLayout.className = "discard-layout";
    handLayout.style.display = "grid";
    handLayout.style.gridTemplateColumns = "repeat(auto-fit, minmax(min(100%/3, max(120px, 100%/5)), 1fr))";
    handLayout.style.justifyContent = "center";
    handLayout.style.alignItems = "center";

    let handCards = Array(5);

    for (let i = 0; i < 5; i++) {

        let playerHandTopCard = document.createElement("div");
        playerHandTopCard.className = "empty";
        playerHandTopCard.appendChild(document.createElement("img")).src = imagePath;
        let playerHand = document.createElement("div");
        playerHand.className = "card";
        playerHand.appendChild(playerHandTopCard);

        handCards[i] = document.createElement("div");
        handCards[i].className = "pile";
        handCards[i].appendChild(playerHand);

        handLayout.appendChild(handCards[i]);
    }

        /* APPLY LAYOUT */

    let playerLayout = document.createElement("div");
    playerLayout.className = "player-layout";
    playerLayout.style.display = "grid";
    playerLayout.style.border = "2px solid white";
    playerLayout.appendChild(stockPileContainer);
    playerLayout.appendChild(discardLayout);
    playerLayout.appendChild(handLayout);

    let mainLayout = document.createElement("div");
    mainLayout.className = "main-layout";
    mainLayout.style.display = "grid";
    mainLayout.style.padding = "10px";
    mainLayout.appendChild(drawPileContainer);
    mainLayout.appendChild(buildLayout);
    mainLayout.appendChild(playerLayout);

    document.body.appendChild(mainLayout);

    socket.emit("LETS_PLAY", gameId);

    socket.on("ASSIGN_PLAYER_ID", (id) => {

        myId = id;
        console.log("You are player " + myId);
    });

    socket.on("UPDATE_STOCK_PILE", (player, size, suit, value) => {

        if (player == myId) {

            stockPileAmount.innerText = size;
            stockPileTopCard.className = (deck.name == "Poker" ? deck.suits[suit] + " " : "") + deck.values[value];
        }
    });
}