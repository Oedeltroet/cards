const {Card, Deck} = require("../deck.js");

const numJokers = 18;
const numValues = 12;
const numSequences = 12;
const numBuildPiles = 4;
const numHandCards = 5;

class Gamestate {

    constructor(numPlayers, playWithPokerDecks = false) {

        this.numPlayers = numPlayers;
        this.playerTurn = 0;
        
        // You can play with three poker decks instead of one Skip-Bo deck.
        // This will generate a 3 x 52 = 156 cards deck with four suits (that don't matter).
        // The 3 x 4 = 12 aces (index 0) replace the joker cards.
        if (playWithPokerDecks) {

            this.drawPile = new Deck();

            for (let i = 0; i < 3; i++) {

                this.drawPile.combine(new Deck(4, 0, 12));
            }
        }

        // This will generate a classic Skip-Bo deck.
        // It consists of 12 x 12 value cards + 18 jokers, totaling 162 cards.
        else {

            // create an empty pile
            this.drawPile = new Deck();

            // add 12 sequences of 12 cards (indices 1 to 12)
            for (let i = 0; i < numSequences; i++) {

                this.drawPile.combine(new Deck(1, 1, numValues));
            }

            // add 18 joker cards with index 0
            for (let i = 0; i < numJokers; i++) {

                this.drawPile.addCard(0, 0);
            }
        }

        // Now there is either a 156 cards poker style deck or a 162 cards Skip-Bo deck.
        // Time to shuffle!
        this.drawPile.shuffle();

        // Create an array for the build piles
        this.buildPiles = new Array(numBuildPiles);

        // Initialize each build pile with an empty deck
        this.buildPiles.forEach(element => {

            element = new Deck();
        });

        // The amount of cards on a stock pile depends on the number of players.
        let stockPileSize = (numPlayers <= 4) ? 30 : 20;

        // Create an array that will hold the stock pile, hand cards and discard piles for each player.
        this.playerCards = new Array();

        // Now the origin pile will be split up.
        for (let i = 0; i < numPlayers; i++) {

            let currentPlayer = new Array();

            // Each player gets a stock pile that has to be reduced.
            currentPlayer.push(this.drawPile.draw(stockPileSize));

            // Creating an empty hand for each player
            currentPlayer.push(new Array(0));

            // Four empty discard piles are also created.
            for (let j = 0; j < numBuildPiles; j++) {
                
                currentPlayer.push(new Deck());
            }

            this.playerCards.push(currentPlayer);
        }

        // The game is set up and ready to play.
    }

    nextTurn() {

        this.playerTurn = (this.playerTurn + 1) % this.numPlayers;
    };

    drawHand(playerId) {

        let hand = this.playerCards[playerId][1];
        let cardsToDraw = numHandCards - hand.length;

        for (let i = 0; i < cardsToDraw; i++) {

            hand.push(this.drawPile.draw());
        }

        console.log(hand);
    }
}

module.exports = {
    
    Gamestate: Gamestate
}