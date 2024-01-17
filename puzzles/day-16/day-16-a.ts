import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { initializeGrid, traverseGrid } from './approach-A.ts';

Verbose.setActive(true);
const verbose = new Verbose();

function parseData(data: string[]): string[][] {
  return data.map(m => m.split(''));
}

export async function day16a(dataPath?: string) {
  const data = await readData(dataPath);
  const grid = initializeGrid(parseData(data));
  
  //start the traversing top/left moving right
  traverseGrid(grid, [0,0], [0,1]);
  if (Verbose.isActive()) {
    grid.forEach(row => {
      row.forEach(tile => verbose.add(tile.beams === 0 ? '.' : '#'));
      verbose.display();
    })
  }

  return grid.reduce((sum, row) => {
    sum += row.filter(t => t.beams > 0).length;
    return sum;
  }, 0);
}

const answer = await day16a();
outputHeading(16, 'a');
outputAnswer(answer);
