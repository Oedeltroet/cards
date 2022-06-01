const {Card, Deck} = require("../deck.js");

const numJokers = 18;
const numValues = 12;
const numSequences = 12;
const numBuildPiles = 4;
const numHandCards = 5;

class Gamestate {

    constructor(numPlayers, playWithPokerDecks = false, numDescendingPiles = 2) {

        this.numPlayers = numPlayers;
        this.numDescendingPiles = numDescendingPiles;
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
        for (let i = 0; i < numBuildPiles; i++) {

            this.buildPiles[i] = new Deck();
        }

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
    }

    /*
        PLAYER CARDS CODES
        0 = stock pile (pile)
        1 = hand cards (array)
        2..5 = discard piles (pile)

        ORIGIN PILE CODES
        0 = stock pile
        1..4 = discard piles
        5..9 = hand cards

        TARGET PILE CODES
        0..3 = build piles
        4..7 = discard piles
    */
    transfer(originPile, targetPile) {

        let card;

        // from stock pile
        if (originPile == 0) {

            card = this.playerCards[this.playerTurn][0].draw();

            // to build pile
            if (targetPile <= 3) {

                // ... TODO
            }
        }

        // from discard pile
        else if (originPile < 5) {

            // to build pile
            if (targetPile <= 3) {

                // ... TODO
            }
        }

        // from hand cards
        else {

            let hand = this.playerCards[this.playerTurn][1];
            card = hand[originPile - 5];

            // to build pile
            if (targetPile <= 3) {

                let pile = this.buildPiles[targetPile];
                console.log(this.buildPiles);
                console.log(targetPile);

                if (this.build(card, pile, targetPile)) {

                    // remove card from hand
                    hand.splice(originPile - 5, 1);

                    // draw new hand if necessary
                    if (hand.length == 0) {

                        this.drawHand(this.playerTurn);
                    }

                    return true;
                }
            }

            // to discard pile (ends the turn)
            else if (targetPile <= 7) {

                // remove card from hand
                hand.splice(originPile - 5, 1);

                // draw new hand if necessary
                if (hand.length == 0) {

                    this.drawHand(this.playerTurn);
                }

                let pile = this.playerCards[this.playerTurn][targetPile - 2] // [2 + targetPile - 4]
                pile.addCard(card.suit, card.value);

                return true;
            }
        }

        return false;
    }

    build(card, pile, pileIndex = 0) {

        // empty pile
        if (pile.size == 0) {

            if (card.value == 0 ||                                                              // joker
                pileIndex >= (numBuildPiles - this.numDescendingPiles) && card.value == 12 ||   // descending
                pileIndex < (numBuildPiles - this.numDescendingPiles) && card.value == 1)       // ascending
            {
                
                pile.addCard(card.suit, card.value);
                return true;
            }
        }

        // regular pile
        else if (pile.size < 11) {

                // joker
            if (card.value == 0 ||          
                // descending
                pileIndex >= (numBuildPiles - this.numDescendingPiles) && (
                    // regular top card
                    pile.topCard.value != 0 && card.value == pile.topCard.value - 1 ||
                    // joker on top
                    pile.topCard.value == 0 && card.value == 12 - pile.size
                ) ||
                // ascending
                pileIndex < (numBuildPiles - this.numDescendingPiles) && (
                    // regular top card
                    pile.topCard.value != 0 && card.value == pile.topCard.value + 1 ||
                    // joker on top
                    pile.topCard.value == 0 && card.value == pile.size + 1
                ))
            {
                
                pile.addCard(card.suit, card.value);
                return true;
            }
        }

        // finished pile
        else {

            if (card.value == 0 ||                                                              // joker
                pileIndex >= (numBuildPiles - this.numDescendingPiles) && card.value == 1 ||    // descending
                pileIndex < (numBuildPiles - this.numDescendingPiles) && card.value == 12)      // ascending
            {
                
                pile.addCard(card.suit, card.value);

                // add the finished pile to the draw pile
                this.drawPile.combine(pile);

                // shuffle the extended draw pile
                this.drawPile.shuffle();

                // reset the finished pile
                pile = new Deck();

                return true;
            }
        }

        return false;
    }
}

module.exports = {
    
    Gamestate: Gamestate
}