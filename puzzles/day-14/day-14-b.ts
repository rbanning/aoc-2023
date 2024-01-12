import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { tiltGrid } from './approach-A.ts';
import { CharRow, Grid, arrayValue, displayGrid } from './common.ts';
import { Direction, east, north, south, west } from './direction.ts';

Verbose.setActive(true);
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

export async function day14b(dataPath?: string) {
  const data = await readData(dataPath);
  const original = parseData(data);
  verbose.add(`Original Grid`).display();
  displayGrid(original);

  const CYCLES = 3;

  let tilted: Grid = original;
  const spinCycle: Direction[] = [north, west, south, east];
  
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    verbose.newline().add(`----- CYCLE #(${cycle + 1}) ---`).display().newline();
    
    spinCycle.forEach(direction => {
      verbose.newline().display();
    
      tilted = tiltGrid(tilted, direction);
      displayGrid(tilted, direction);
      verbose.newline().display();
    })

    verbose.newline().add(`----- END CYCLE #(${cycle + 1}) ---`).display().newline();

  }
  
  let total = 0;

  total = tilted.reduce((sum, row, index) => sum + arrayValue(row, index, tilted.length, spinCycle.at(-1)), 0);

  return total;
}

const answer = await day14b();
outputHeading(14, 'b');
outputAnswer(answer);
