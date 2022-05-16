var data = {

    "games" : [

        {
            "name" : "Skip-Bo",
            "icon" : "img/thumbnails/skip-bo.png",
            "script" : "scripts/games/skip-bo.js"
        },
        
        {
            "name" : "UNO",
            "icon" : "https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg",
            "script" : "scripts/games/uno.js"
        }
    ]
};

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
            script.src = data.games[i].script;
            document.getElementsByTagName("head")[0].appendChild(script);

            script.onload = function() {

                init();
            };
        }

        td.appendChild(icon);
        td.appendChild(title);

        gameList.appendChild(td);
    }

    document.body.appendChild(gameList);
}

window.onload = function() {

    mainMenu();
};