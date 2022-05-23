function init(socket, gameId) {

    document.body.innerHTML = "";

    var buttonCreateGame = document.createElement("button");
    buttonCreateGame.id = "button-create";
    buttonCreateGame.innerText = "Create";

    buttonCreateGame.onclick = function() {

        socket.emit("createGame", gameId);
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

            socket.emit("joinGame", inputJoinGame.value);
        }
    });

    var menuContainer = document.createElement("div");
    menuContainer.id = "menu";
    menuContainer.appendChild(buttonCreateGame);
    menuContainer.appendChild(joinGame);

    document.body.appendChild(menuContainer);

    socket.on("gameCreated", (roomName) => {

        openLobby(socket, gameId, roomName);
    });

    socket.on("successfullyJoined", (roomName) => {

        openLobby(socket, gameId, roomName);
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

    socket.on("becomeLeader", () => {

        var buttonStartGame = document.createElement("button");
        buttonStartGame.innerText = "Start";
        buttonStartGame.disabled = true;
        buttonStartGame.onclick = () => {

            socket.emit("startGame", gameId, roomName);
        };

        lobbyContainer.appendChild(buttonStartGame);

        socket.on("gameReady", () => {

            console.log("The game is ready.")
            buttonStartGame.disabled = false;
        });
    });

    socket.on("gameStarted", (players) => {

        console.log("The game has started.")
        game(socket, gameId);
    });
}

function game(socket, gameId, players) {

    document.body.innerHTML = "";

    socket.emit("letsPlay", gameId);
}