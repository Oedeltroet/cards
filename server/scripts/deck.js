// So this script is basically a copy-paste from this very helpful tutorial:
// https://www.youtube.com/watch?v=NxRwIZWjLtE

class Card {

    constructor(suit, value) {

        this.suit = suit;
        this.value = value;
    }

    get data() {

        return [this.suit, this.value];
    }
}

class Deck {

    constructor(numSuits = 0, minValue = 0, maxValue = 0) {

        this.cards = [];

        for (let i = 0; i < numSuits; i++) {

            for(let j = minValue; j <= maxValue; j++) {
    
                this.cards.push(new Card(i, j));
            }
        }
    }

    get numberOfCards() {

        return this.cards.length;
    }

    get topCard() {

        return this.cards[this.cards.length - 1];
    }

    shuffle() {

        for (let i = this.numberOfCards - 1; i > 0; i--) {

            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        }
    }

    combine(deck) {

        Array.prototype.forEach.call(deck.cards, card => this.cards.push(card));
    }

    addCard(suit, value) {

        Array.prototype.push(this.cards, new Card(suit, value));
    }

    draw(numCards = 1) {

        if (numCards == 1) {

            return this.cards.pop();
        }

        if (numCards <= this.numberOfCards) {

            let pile = new Deck();

            for (let i = 0; i < numCards; i++) {

                pile.cards.push(this.cards.pop());
            }

            return pile;
        }
    }
}

module.exports = { Card, Deck }