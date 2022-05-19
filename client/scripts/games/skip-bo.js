function init() {

    document.body.innerHTML = "<div id='menu'><button id='host' onclick='createGame'>Create game</button></div>";

    //var socket = io("http://localhost:3000", { transports : ['websocket'] });
    var socket = io("https://cards.oedel.me:3000", { transports : ['websocket'] });

    function createGame() {

        socket.emit("createGame");
    }
};