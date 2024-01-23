import { Coordinate } from '../../helpers/coordinate.ts';
import { PriorityQueue } from '../../helpers/priority-queue.ts';
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
  
  const pq = new PriorityQueue<number>();
  pq.add(1,2,3,4,5);

  verbose.add(`Test #1 (range: ${pq.front()} - ${pq.rear()})`).display();
  while(!pq.isEmpty()) {
    verbose.add(`${pq.next()}`).display();
  }
  verbose.newline().display();

  pq.clear().add(5,4,3,2,1);

  verbose.add(`Test #2 (range: ${pq.front()} - ${pq.rear()})`).display();
  while(!pq.isEmpty()) {
    verbose.add(`${pq.next()}`).display();
  }
  verbose.newline().display();

  pq.clear().add(2,1,5,3,4);

  verbose.add(`Test #3 (range: ${pq.front()} - ${pq.rear()})`).display();
  while(!pq.isEmpty()) {
    verbose.add(`${pq.next()}`).display();
  }
  verbose.newline().display();

  pq.clear().add(2,4,2,1,1,3,5,3,4,5);

  verbose.add(`Test #4 (range: ${pq.front()} - ${pq.rear()})`).display();
  while(!pq.isEmpty()) {
    verbose.add(`${pq.next()}`).display();
  }
  verbose.newline().display();

  const total = 0;

  // displayGrid(grid);
  // verbose.newline().display();

  // const start: Coordinate = [0,0];
  // const end: Coordinate = [grid.length-1, grid[0].length-1];

  // //start the traversing top/left moving right
  // const path = findShortestRoute(grid, start, end);
  // const total = calcTotalCost(path);

  // verbose.add(`Nodes visited: ${path.length}`).display();
  // verbose.add(`Total Cost of last in route: ${path[path.length-1].costFromStart}`).display();
  // verbose.add(`Total Cost calculated from route: ${total}`).display();
  // displayGridRoute(path);

  // verbose.newline().display();
  // displayGrid(grid, path);

  return total;
}

const answer = await day17a();
outputHeading(17, 'a');
outputAnswer(answer);
