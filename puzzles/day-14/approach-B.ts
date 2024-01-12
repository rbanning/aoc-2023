import { Verbose } from "../../shared.ts";
import { CharRow, Grid, GridCoordMeta, GridMeta, cloneGrid, emptySpace, moveRoundRock, roundRock, squareRock } from "./common.ts";
import { Direction, isReverseDirection, isVerticalDirection } from "./direction.ts";

/** APPROACH B **
*
*   for each cycle...
*     rotate grid
*       for each row in grid
*         move rocks to front
*
*/

export type TransformCache = {[key: string]: CharRow};

export function transposeGrid(grid: Grid): Grid {
  
  const result: Grid = Array(grid[0].length)
    .fill([] as CharRow)
    .map(_ => Array(grid.length).fill(emptySpace));

  //first col becomes first row   
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++)
    result[col][row] = grid[row][col];
  }

  return result;
}

export function tiltGrid(grid: Grid) {
  const verbose = new Verbose();

  const cache: TransformCache = {};
  const working: Grid = cloneGrid(grid);

  for (let index = 0; index < working.length; index++) {
    working[index] = moveRocksToFront(working[index], cache);
  }

  return working;
}

export function moveRocksToFront(row: CharRow, cache: TransformCache) {
  const key = row.join('');
  if (cache[key]) { return cache[key]; }
  //else
  let result = [...row];
  
  //only want to proceed if there are any rocks in the row
  if (result.includes(roundRock)) {
    let target = 0;
    while (target < result.length-1) {
      if (result[target] === emptySpace) {
        for (let index = target+1; index < result.length && result[index] !== squareRock; index++) {
          if (result[index] === roundRock) {
            //swap
            result[target] = roundRock;
            result[index] = emptySpace;
            target += 1;
          }
        }
      }
      target += 1;
    }
  }
  
  //done
  cache[key] = result;
  return result;
}


export function test(row: CharRow) {
  const verbose = new Verbose();
  verbose.add(`Testing: ${row.join('')}`).display();
  const result = moveRocksToFront(row, {});
  verbose.add(`Result : ${result.join('')}`).display();
}