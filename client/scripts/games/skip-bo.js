function init(socket, gameId) {

    document.body.innerHTML = "<div id='menu'><button id='host'>Create game</button></div>";
    document.getElementById("host").onclick = function() {

        socket.emit("createGame", gameId);
    };
};