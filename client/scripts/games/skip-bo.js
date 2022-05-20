function init(socket, gameId) {

    document.body.innerHTML = "<div id='menu'><button id='host'>Create game</button></div>";

    document.getElementById("host").onclick = function() {

        socket.emit("createGame", gameId);
    };

    socket.on("gameCreated", (roomName) => {

        var text = document.createElement("p");
        text.innerText = roomName;
        document.getElementById("menu").appendChild(text);
    });
};