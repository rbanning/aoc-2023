import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();

class GameCard {
  id: number;
  winningNumbers: number[] = [];
  gameNumbers: number[] = [];
  

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

export async function day4a(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);
  const cards = data.map(line => parseGameCard(line));

  return cards.reduce((sum, card) => {
    return sum + card.calcPointsWon();
  }, 0);
}

const answer = await day4a();
outputHeading(4, 'a');
outputAnswer(answer);
