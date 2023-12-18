import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();

class GameCard {
  id: number;
  winningNumbers: number[] = [];
  gameNumbers: number[] = [];
  
  points: number = 0;

  findWinners() {
    return this.gameNumbers.filter(num => this.winningNumbers.includes(num));
  }
}

function stringNumbersToArray(input: string, delim: string = ' '): number[] {
  const ret = input.split(delim)
    .filter(Boolean)
    .map(m => parseInt(m.trim()));

  if (ret.some(v => isNaN(v))) { 
    console.warn("Invalid number array", {input, ret});
    throw new Error('Unable to parse one of the values in the number array'); 
  }
  //else
  return ret;
}

function parseGameCard(line: string): GameCard {
  const card = new GameCard();

  //separate card id from numbers
  const parts = line.split(':').map(m => m.trim());
  if (parts.length !== 2) { throw new Error(`ERROR: parseGameCard - expected two parts to the card, card id and numbers - instead got ${parts.length} parts - > ${parts[0]}`); }

  card.id = parseInt(parts[0].split(' ').filter(Boolean)[1]);

  const numbers = parts[1].split('|').map(m => m.trim());
  if (numbers.length !== 2) { throw new Error(`ERROR: parseGameCard - expected two sets of numbers on the card, winners and game numbers - instead got ${numbers.length} sets`); }
  card.winningNumbers = stringNumbersToArray(numbers[0]);
  card.gameNumbers = stringNumbersToArray(numbers[1]);

  return card;
}

function exploreCard(cardIndex: number, stack: GameCard[]) {
  if (cardIndex < 0 || cardIndex >= stack.length) { throw new Error(`exploreCard - index out of bounds (${cardIndex} of ${stack.length})`); }
  const card = stack[cardIndex];
  const winners = card.findWinners().length;

  if (card.points > 0) {
    verbose.add(`> cached Card #${card.id} with ${winners} winner(s) and ${card.points} "points"`).display();
    return card.points;  //no need to proceed?
  }

  let count = 1;
  verbose.add(`> exploring Card #${card.id} with ${winners} winner(s)`).display();
  for (let delta = 1; delta <= winners; delta++) { 
    const i = cardIndex + delta;
    if (i < stack.length) { 
      count = count + exploreCard(i, stack);
    } else {
      throw new Error(`Beyond the bounds: index: ${cardIndex}, winners: ${winners}, i: ${i}`);
    }
  }

  verbose.add(`  - done with #${card.id}, count: ${count}`).display();
  card.points = count;
  return count;
}

export async function day4b(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);
  const cards = data.map(line => parseGameCard(line));

  if (Verbose.isActive()) {
    console.log(cards.map(c => {
      return {
        id: c.id,
        winners: c.findWinners().length,
      }
    }));
  }

  return cards.reduce((sum, card, currentIndex) => {
    return sum + exploreCard(currentIndex, cards);
  }, 0);
}

const answer = await day4b();
outputHeading(4, 'b');
outputAnswer(answer);
