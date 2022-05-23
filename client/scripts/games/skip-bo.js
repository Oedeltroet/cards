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

    var lobbyCode = document.createElement("p");
    lobbyCode.innerText = roomName;

    var lobbyContainer = document.createElement("div");
    lobbyContainer.id = "lobby";    
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

        socket.on("GAME_READY", () => {

            console.log("The game is ready.")
            buttonStartGame.disabled = false;
        });
    });

    socket.on("GAME_STARTED", (players, deck, deckStyle) => {

        console.log("The game has started.")
        game(socket, gameId, players, deck, deckStyle);
    });
}

function game(socket, gameId, players, deck, deckStyle) {

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
    let image = document.createElement("img");
    image.src = imagePath;

    let drawPile = document.createElement("div");
    drawPile.className = "spades 7"; // change to "hidden"
    drawPile.appendChild(image);

    let drawPileContainer = document.createElement("div");
    drawPileContainer.className = "card";
    drawPileContainer.appendChild(drawPile);

    document.body.appendChild(drawPileContainer);

    socket.emit("LETS_PLAY", gameId);
}