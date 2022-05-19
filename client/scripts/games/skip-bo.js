function init() {

    document.body.innerHTML = "<div id='menu'><button id='host' onclick='createGame()'>Create game</button></div>";

    //var socket = io("https://localhost:3000");
    var socket = io("https://cards.oedel.me:3000");

    // function createGame() {

    //     socket.emit("createGame");
    // }
};