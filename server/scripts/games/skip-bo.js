const {Card, Deck} = require("../deck.js");

const numJokers = 18;
const numValues = 12;
const numSequences = 12;
const numBuildPiles = 4;

class Gamestate {

    constructor(numPlayers, playWithPokerDecks = false) {
        
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

        console.log(this.drawPile);

        // Now there is either a 156 cards poker style deck or a 162 cards Skip-Bo deck.
        // Time to shuffle!
        this.drawPile.shuffle();

        // The amount of cards on a stock pile depends on the number of players.
        let stockPileSize = (numPlayers <= 4) ? 30 : 20;

        // Create an array that will hold both the stockpile and the discard piles for each player.
        this.playerCards = [];

        // Now the origin pile will be split up.
        for (let i = 0; i < numPlayers; i++) {

            // Each player gets a stock pile that has to be reduced.
            this.playerCards.push(this.drawPile.draw(stockPileSize));

            // Creating an empty hand for each player
            this.playerCards.push(new Deck());

            // Four empty discard piles are also created.
            for (let j = 0; j < numBuildPiles; j++) {
                
                this.playerCards.push(new Deck());
            }
        }

        // The game is set up and ready to play.
    }
}

module.exports = {
    
    Gamestate: Gamestate
}