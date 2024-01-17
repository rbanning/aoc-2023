import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { tiltGrid } from './approach-B.ts';
import { CharRow, Grid, arrayValue, displayGrid } from './common.ts';
import { Day14Cache, Day14GridCache } from './day-14-cache.ts';
import { Direction, east, north, south, west } from './direction.ts';

Verbose.setActive(true);
const verbose = new Verbose();

const FULL_RUN_CYCLES = 1000000000;
const CYCLES = FULL_RUN_CYCLES;

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

function countLoad(grid: Grid) {
  return grid.reduce((sum, row, index) => sum + arrayValue(row, index, grid.length, north), 0);
}


export async function day14b(dataPath?: string) {
  const data = await readData(dataPath);
  const original = parseData(data);
  verbose.add(`Original Grid`).display();
  displayGrid(original);
  

  let tilted: Grid = original;
  const cache = new Day14Cache();
  const gridCache = new Day14GridCache();

  let indexOfRepeatedCycle = -1;
  let cycle = 1;
  while (cycle <= CYCLES && indexOfRepeatedCycle < 0) {
    tilted = performCycle(tilted, cache);
    indexOfRepeatedCycle = gridCache.indexOf(tilted);
    if (indexOfRepeatedCycle < 0) {
      gridCache.add(tilted, countLoad(tilted));
    }
    cycle++;
  }
  cycle = cycle - 1; //how many cycles were completed

  if (Verbose.isActive()) {
    verbose.newline().display();
    verbose.add(`----- CYCLE #(${cycle}) ---`).display();    
    displayGrid(tilted, north);
    verbose.newline().display();
  }

   if (indexOfRepeatedCycle < 0) { verbose.add(`Was unable to detect any repeated pattern after ${cycle} cycles`).display(); return -1; }

  const cyclesPerLoop = gridCache.length - indexOfRepeatedCycle;  //the number of cycles in the loop
  const remainingCycles = (CYCLES - (indexOfRepeatedCycle + 1));  //the number of cycles still needed from the start of loop to target
  const loopOffset = remainingCycles % cyclesPerLoop;             //the number of cycles within the loop to reach target
  const loopIndex = indexOfRepeatedCycle + loopOffset;            //the index of the target within the cache

  verbose
    .add(`total cycles performed: ${cycle} and grid cache count: ${gridCache.length}`).display()
    .add(`indexOfRepeatedCycle = ${indexOfRepeatedCycle}`).display()
    .add(`remaining cycles: ${remainingCycles}`).display()
    .add(`cycles per loop: ${cyclesPerLoop}`).display()
    .add(`loop offset: ${loopOffset}`).display()
    .add(`loop index that has our value: ${loopIndex}`).display();

  
  
  let grid = gridCache.getGrid(loopIndex);
  verbose.add(`Grid at ${loopIndex} (expected solution)`).display();
  displayGrid(grid, north);

  
  let total = gridCache.get(loopIndex)?.value;

  return total;
}

function performCycle(tilted: Grid, cache: Day14Cache) {
  
  for (let i = 0; i < spinCycle.length; i++) {
    const direction = spinCycle[i];
    tilted = tiltGrid(tilted, direction, cache); 
    if (Verbose.isActive() && false) {
      verbose.add(`>>>> Tilted ${direction} <<<<`).display();    
      displayGrid(tilted);
    }
  }

  return tilted;
}

const answer = await day14b();
outputHeading(14, 'b');
outputAnswer(answer);
