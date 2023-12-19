import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();

const cards = ['J','2','3','4','5','6','7','8','9','T','Q','K','A'] as const;
type Card = typeof cards[number];

const handTypes = ['high-card','one-pair','two-pair','three-kind','full-house','four-kind','five-kind'] as const;
type HandType = typeof handTypes[number];

type CardDistribution = {[key in Card]?: number};
type HandMatrix = {
  hand: Card[],
  bid: number;
  dist: CardDistribution,
  type?: HandType,
  value?: number
};


function parseInputLine(line: string): HandMatrix {
  const parts = line.split(' ').filter(Boolean);
  if (parts.length !== 2) { throw new Error(`Error parsing line: expected two parts but found ${parts.length} - ${line}`); }
  const hand = parts[0]
    .split('')
    .filter(Boolean)
    .map(m => m as Card);
  
  if (hand.length !== 5) { throw new Error(`Error parsing line: expected hand to have five cards but found ${parts.length} - ${line}`); }
  
  const bid = parseInt(parts[1]);
  if (isNaN(bid)) { throw new Error(`Error parsing line: expected bid to be a valid integer - ${line}`); }

  return buildMatrix(hand, bid);
}

function buildMatrix(cards: Card[], bid: number): HandMatrix {
  const matrix: HandMatrix = {
    hand: cards,
    bid,
    dist: {}
  };
  cards.forEach(c => {
    if (!matrix.dist[c]) { matrix.dist[c] = 0; }
    matrix.dist[c] += 1;
  });
  matrix.type = typeOfHand(matrix.dist);
  matrix.value = handTypes.indexOf(matrix.type);
  return matrix;
}

function typeOfHand(dist: CardDistribution): HandType {
  const cards = Object.keys(dist);
  const hasCount = (count: number): boolean => {
    const jokers = (dist['J'] ?? 0);
    return cards
      .filter(c => c !== 'J') //ignore jokers
      .some(c => (dist[c] + jokers) === count);
  }
  //note edge cases 
  // --- all are jokers (five-kind)
  // --- full-house cannot use the joker twice so it must have a three of a kind with (or without) a joker AND a pair without a joker
  if (hasCount(5) || cards.every(c => c === 'J')) { return 'five-kind'; }
  if (hasCount(4)) { return 'four-kind'; }
  if (hasCount(3)) {
    //could be 0, 1 or 2 jokers.  If there were three, then it would be at lease a four-kind
    switch(dist['J'] ?? 0) {
      case 0: 
        return hasCount(2) ? 'full-house' : 'three-kind';
      case 1: 
        return cards.filter(c => dist[c] === 2).length === 2 ? 'full-house' : 'three-kind';
      case 2:
        return cards.filter(c => c !== 'J' && dist[c] === 2).length === 1 ? 'full-house' : 'three-kind';
      default:
        throw new Error(`Error in typeOfHand - found three of a kind but with ${dist['J']} jokers... We thought it could not be greater than 2`);
    }
  }
  if (hasCount(2)) {
    //check for two-pair  (note - not worried about jokers)
    if (cards.filter(c => dist[c] === 2).length === 2) { return 'two-pair'; }
    else { return 'one-pair'; }
  }
  //else
  return 'high-card';
}

function valueOfCard(card: Card): number {
  return cards.indexOf(card);
}

function compareHands(a: HandMatrix, b: HandMatrix) {
  if (a.value === b.value) {
    let index = 0;
    while (
        index < a.hand.length 
        && index < b.hand.length 
        && a.hand[index] === b.hand[index]) {
      index++;
    }
    if (index < a.hand.length && index < b.hand.length) {
      const aValue = valueOfCard(a.hand[index]);
      const bValue = valueOfCard(b.hand[index]);
      if (aValue !== bValue) {
        return aValue > bValue ? 1 : -1;
      }
    } 
    //else
    return 0;
  } 
  else if (a.value > b.value) { return 1; }
  else { return -1; }

}


export async function day7b(dataPath?: string) {
  const data = await readData(dataPath);
  const matrices = data.map(parseInputLine);
  matrices.sort(compareHands);

  if (Verbose.isActive()) {
    matrices.forEach((m, index) => {
      verbose.add(`hand: ${m.hand.join('')}, bid: ${m.bid}, type: ${m.type}, winnings: ${(index+1)*m.bid}, jokers: ${m.hand.filter(m => m === 'J').length}`).display();
    });
  }

  return matrices.reduce((sum, matrix, index) => {
    return sum + ((index+1) * matrix.bid);
  }, 0);
}

const answer = await day7b();
outputHeading(7, 'b');
outputAnswer(answer);
