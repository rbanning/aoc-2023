import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { tiltGrid } from './approach-A.ts';
import { CharRow, Grid, arrayValue, displayGrid } from './common.ts';
import { east, north, south, west } from './direction.ts';

Verbose.setActive(false);
const verbose = new Verbose();

function parseData(data: string[]): Grid {
  const grid: Grid = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i].trim();
    if (element) {
      grid.push(element.split('') as CharRow);
    } else {
      throw new Error('Found empty row in data');
    }
  }

  return grid;
}

export async function day14a(dataPath?: string) {
  const data = await readData(dataPath);

  const direction = north;

  verbose.add(`Tilting Grid - ${direction}`).display();
  const original = parseData(data);
  displayGrid(original, direction);
  verbose.newline().display();

  const tilted = tiltGrid(original, direction);
  displayGrid(tilted, direction);
  verbose.newline().display();
  
  let total = 0;

  total = tilted.reduce((sum, row, index) => sum + arrayValue(row, index, tilted.length, direction), 0);

  return total;
}

const answer = await day14a();
outputHeading(14, 'a');
outputAnswer(answer);
