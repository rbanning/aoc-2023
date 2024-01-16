import { Verbose } from "../../shared.ts";
import { CharRow, Grid, GridCoordMeta, GridMeta, cloneGrid, emptySpace, moveRoundRock, roundRock, squareRock } from "./common.ts";
import { Day14Cache } from "./day-14-cache.ts";
import { Direction, east, isReverseDirection, isVerticalDirection, north, south, west } from "./direction.ts";

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

export function tiltGrid(grid: Grid, direction: Direction, cache: Day14Cache) {

  if (direction === east || direction === west) {
    for (let index = 0; index < grid.length; index++) {
      grid[index] = moveRocksInRow(grid[index], direction === west, cache);
    }
  } else {
    for (let index = 0; index < grid[0].length; index++) {
      const row = moveRocksInRow(extractColumn(grid, index), direction === north, cache);
      updateGridColumn(grid, index, row);
    }
  }

  return grid;
}


export function moveRocksInRow(row: CharRow, toFront: boolean, cache: Day14Cache) {
  
  //only want to proceed if there are any round rocks in the row
  if (row.some(ch => ch === roundRock)) {
    
    //check grid
    if (cache.hasKey(row, toFront)) {
      const result = cache.get(row, toFront);
      new Verbose().add(` using cache[${row.join('')},${toFront}] = ${result.join('')}`).display();
      return result;
    }


    let working = toFront ? [...row] : [...row].reverse();
    let target = 0; 
    while (target < working.length) {
      if (working[target] === emptySpace) {
        for (let index = target+1; index < working.length && working[index] !== squareRock; index++) {
          if (working[index] === roundRock) {
            //swap
            working[target] = roundRock;
            working[index] = emptySpace;
            target += 1;
          }
        }
      }
      target += 1;
    }

    //save
    if (!toFront) { working = working.reverse(); }
    cache.add(working, row, toFront); //cache result
    return working;
  }

  //else (nothing to do)
  return row;
}

function extractColumn(grid: Grid, columnIndex: number): CharRow {
  const result: CharRow = Array(grid[columnIndex].length);
  for (let row = 0; row < grid.length; row++) {
    result[row] = grid[row][columnIndex];
  }
  return result;
}

function updateGridColumn(grid: Grid, columnIndex: number, row: CharRow) {
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    grid[rowIndex][columnIndex] = row[rowIndex];
  }
  return grid;
}

