import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { transposeGrid, tiltGrid } from './approach-B.ts';
import { CharRow, Grid, arrayValue, displayGrid, emptySpace, roundRock } from './common.ts';
import { Day14Cache } from './day-14-cache.ts';
import { Direction, east, north, south, west } from './direction.ts';

Verbose.setActive(true);
const verbose = new Verbose();

const CYCLES = 2;
const spinCycle: Direction[] = [north, west, south, east];

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
  

  let tilted: Grid = original;
  const cache = new Day14Cache();

  for (let cycle = 1; cycle <= CYCLES; cycle++) {
    tilted = performCycle(tilted, cache);
    verbose.newline().display();
    verbose.add(`----- CYCLE #(${cycle}) ---`).display();    
    displayGrid(tilted);
    verbose.newline().display();
  }

  let total = 0;

  total = tilted.reduce((sum, row, index) => sum + arrayValue(row, index, tilted.length, north), 0);

  return total;
}

function performCycle(tilted: Grid, cache: Day14Cache) {
  
  for (let i = 0; i < spinCycle.length; i++) {
    const direction = spinCycle[i];
    tilted = tiltGrid(tilted, direction, cache); 
    verbose.add(`>>>> Tilted ${direction} <<<<`).display();    
    displayGrid(tilted);
  }

  return tilted;
}

const answer = await day14b();
outputHeading(14, 'b');
outputAnswer(answer);
