import { CharRow, Grid, emptySpace, roundRock, squareRock } from "./common.ts";
import { Day14Cache } from "./day-14-cache.ts";
import { Direction, east, north, south, west } from "./direction.ts";

/** APPROACH B **
*
*   for each cycle...
*     rotate grid
*       for each row in grid
*         move rocks to front
*
*/


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


function moveRocksInRow(row: CharRow, toFront: boolean, cache: Day14Cache) {
  
  //only want to proceed if there are any round rocks in the row
  if (row.some(ch => ch === roundRock)) {
    
    //check grid
    if (cache.hasKey(row, toFront)) {
      return cache.get(row, toFront);
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
    //debug: removing cache from moveRocksInRow... cache.add(working, row, toFront); //cache result
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

