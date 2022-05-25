var socket;
var data = {};

function mainMenu() {

    let text = document.createElement("p");
    text.innerText = "Choose a game!"
    text.setAttribute("id", "choose-a-game");

    document.body.innerHTML = "";
    document.body.appendChild(text);
    
    let gameList = document.createElement("div");
    gameList.setAttribute("id", "game-list");

    for (let i = 0; i < data.games.length; i++) {

        let td = document.createElement("td");

        let icon = document.createElement("img");
        icon.setAttribute("class", "game-icon");
        icon.setAttribute("src", data.games[i].icon);

        let title = document.createElement("p");
        title.setAttribute("class", "game-title");
        title.innerText = data.games[i].name;

        td.onclick = function() {

            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "scripts/games/" + data.games[i].script;
            document.getElementsByTagName("head")[0].appendChild(script);

            script.onload = function() {

                init(socket, i);
            };
        }

        td.appendChild(icon);
        td.appendChild(title);

        gameList.appendChild(td);
    }

    document.body.appendChild(gameList);
}

window.onload = function() {

    document.body.innerHTML = "";

        /* LOAD CSS FILE FOR THE CARD DECK */

    let stylesheetPath = "styles/decks/english_pattern.css";
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

    let imagePath = "img/decks/english_pattern.svg";

    // draw pile
    let drawPileTopCard = document.createElement("div");
    drawPileTopCard.className = "clubs A"; // change to "hidden"
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

    // own stock pile
    let stockPileTopCard = document.createElement("div");
    stockPileTopCard.className = "diamonds Q"; // change to "hidden"
    stockPileTopCard.appendChild(document.createElement("img")).src = imagePath;
    let stockPile = document.createElement("div");
    stockPile.className = "card";
    stockPile.appendChild(stockPileTopCard);
    let stockPileAmount = document.createElement("p");
    stockPileAmount.innerText = "Stock Pile";
    let stockPileContainer = document.createElement("div");
    stockPileContainer.className = "pile";
    stockPileContainer.appendChild(stockPile);
    stockPileContainer.appendChild(stockPileAmount);

    // main grid
    let mainLayout = document.createElement("div");
    mainLayout.className = "main-layout";
    mainLayout.style.display = "inline-grid";
    mainLayout.appendChild(drawPileContainer);
    mainLayout.appendChild(stockPileContainer);

    document.body.appendChild(mainLayout);

    // socket = io("http://localhost:3000", { transports : ['websocket'] });
    // //socket = io("https://cards.oedel.me:3000", { transports : ['websocket'] });

    // socket.on("connect", () => {

    //     console.log("Connected to the server.");

    //     socket.emit("REQUEST_DATA");
    //     socket.on("SEND_DATA", serverData => {

    //         data = serverData;
    //         mainMenu();
    //     });
    // });

    // socket.on("disconnect", () => {

    //     console.log("Disconnected from the server.")
    // });
};