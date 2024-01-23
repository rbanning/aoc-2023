import { Coordinate } from '../../helpers/coordinate.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { buildGrid, findShortestRoute } from './approachA.ts';
import { calcTotalCost, displayGrid, displayGridRoute } from './common.ts';

Verbose.setActive(true);
const verbose = new Verbose();

function parseData(data: string[]): string[][] {
  return data.map(m => m.split(''));
}

export async function day17a(dataPath?: string) {
  const data = await readData(dataPath);
  const grid = buildGrid(parseData(data));
  
  displayGrid(grid);
  verbose.newline().display();

  const start: Coordinate = [0,0];
  const end: Coordinate = [grid.length-1, grid[0].length-1];

  //start the traversing top/left moving right
  const path = findShortestRoute(grid, start, end);
  const total = calcTotalCost(path);

  verbose.add(`Nodes visited: ${path.length}`).display();
  verbose.add(`Total Cost of last in route: ${path[path.length-1].costFromStart}`).display();
  verbose.add(`Total Cost calculated from route: ${total}`).display();
  displayGridRoute(path);

  verbose.newline().display();
  displayGrid(grid, path);

  return total;
}

const answer = await day17a();
outputHeading(17, 'a');
outputAnswer(answer);
