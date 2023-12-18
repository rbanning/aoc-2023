import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

class GameCard {
  id: number;
  winningNumbers: number[] = [];
  gameNumbers: number[] = [];
  
  instances: number = 1;

  findWinners() {
    return this.gameNumbers.filter(num => this.winningNumbers.includes(num));
  }

  calcPointsWon() {
    const winners = this.findWinners();    
    return winners.length > 0 ? Math.pow(2, winners.length-1) : 0;
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

function addCardInstancesFrom(currIndex: number, stack: GameCard[]) {
  if (currIndex < 0 || currIndex >= stack.length) { throw new Error(`addCardInstancesFrom - index out of bounds (${currIndex} of ${stack.length})`); }
  const card = stack[currIndex];
  const winners = card.findWinners().length;
  for (let delta = 1; delta <= winners; delta++) {    
    const i = currIndex + delta;
    if (i < stack.length) { 
      stack[i].instances += 1;  //increment
    } else {
      throw new Error(`Beyond the bounds: index: ${currIndex}, winners: ${winners}, i: ${i}`);
    }
  }
}

export async function day4b(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);
  const cards = data.map(line => parseGameCard(line));

  cards.forEach((_, index) => addCardInstancesFrom(index, cards));

  console.log(cards.map(c => {
    return {
      id: c.id,
      winners: c.findWinners().length,
      instances: c.instances
    }
  }))

  return cards.reduce((sum, card) => {
    return sum + card.instances;
  }, 0);
}

const answer = await day4b();
outputHeading(4, 'b');
outputAnswer(answer);
