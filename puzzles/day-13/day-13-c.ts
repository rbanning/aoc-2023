import { CoinGame } from '../../helpers/sequences.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

//NOTE: this is a practice to test the Coin Game problem

export async function day13x(dataPath?: string) {
  const data = await readData(dataPath);

  verbose.newline().display().add('Coin Game Problem...').display();
  data.map(line => {
    const values = line.trim()
      .split(',')
      .map(x => parseInt(x))
      .filter(Boolean);
    verbose.add(line).display();
    const gamePlay = CoinGame.solveBasic(values);
    verbose.add(` I go first: ${gamePlay.join(',')}`).display();

    return gamePlay[0]; //want to know the first move 
  });

  const total = '';
  return total;
}

const answer = await day13x();
outputHeading(13, 'x');
outputAnswer(answer);
