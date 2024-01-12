import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { transposeGrid, tiltGrid, moveRocksToFront, test } from './approach-B.ts';
import { CharRow, Grid, arrayValue, displayGrid, emptySpace, roundRock } from './common.ts';
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
  
  const CYCLES = 1;

  let tilted: Grid = original;
  const spinCycle: Direction[] = [north, west, south, east];
  
  for (let cycle = 1; cycle <= CYCLES; cycle++) {
    tilted = performCycle(tilted);
  }
    verbose.newline().add('Restored Grid').display();
    tilted = transposeGrid(tilted);
    displayGrid(tilted, north);

  let total = 0;

  total = tilted.reduce((sum, row, index) => sum + arrayValue(row, index, tilted.length, north), 0);

  return total;
}

function performCycle(tilted: Grid, COUNT: number = 4) {
  
  for (let i = 1; i <= COUNT; i++) {
    verbose.add(`----- CYCLE #(${i}) ---`).display();
    
    verbose.add('Tilted & Transposed Grid').display();
    tilted = tiltGrid(transposeGrid(tilted)); 
    displayGrid(tilted);
  }

  return tilted;
}

const answer = await day14b();
outputHeading(14, 'b');
outputAnswer(answer);
