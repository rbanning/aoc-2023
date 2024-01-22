import { Coordinate } from '../../helpers/coordinate.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { buildGrid, findShortestRoute } from './approachA.ts';

Verbose.setActive(true);
const verbose = new Verbose();

function parseData(data: string[]): string[][] {
  return data.map(m => m.split(''));
}

export async function day17a(dataPath?: string) {
  const data = await readData(dataPath);
  const grid = buildGrid(parseData(data));
  
  const start: Coordinate = [0,0];
  const end: Coordinate = [grid.length-1, grid[0].length-1];

  //start the traversing top/left moving right
  const path = findShortestRoute(grid, start, end);

  if (Verbose.isActive()) {
    path.forEach((p, index) => {
      if (index > 0) {
        verbose.add(' --> ');
      }
      verbose.add(`[${p.row,p.col}](${p.heatLoss})`);
    });
    verbose.display();
  }

  return 0;
}

const answer = await day17a();
outputHeading(17, 'a');
outputAnswer(answer);
