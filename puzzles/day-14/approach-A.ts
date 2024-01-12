import { Verbose } from "../../shared.ts";
import { Grid, GridCoordMeta, GridMeta, cloneGrid, moveRoundRock, roundRock } from "./common.ts";
import { Direction, isReverseDirection, isVerticalDirection } from "./direction.ts";

export function tiltGrid(grid: Grid, direction: Direction) {
  const verbose = new Verbose();

  const working: Grid = cloneGrid(grid);
  const isVertical = isVerticalDirection(direction);
  const isReverse = isReverseDirection(direction);

  const outerMeta: GridCoordMeta = {
    count: isVertical ? grid.length : grid[0].length, 
    start: 0,
    end: 0,
    delta: isReverse ? -1 : 1,
  }

  const innerMeta: GridCoordMeta = {
    count: isVertical ? grid[0].length : grid.length,   
    start: 0,
    end: 0,
    delta: isReverse ? -1 : 1,
  }

  //fix the start/end coords
  if (isVertical) {
    //outer === row, inner === col
    outerMeta.start = isReverse ? grid.length - 2 : 1;  //skip the first row/col on the outer
    outerMeta.end = isReverse ? 0 : grid.length - 1;
    innerMeta.start = isReverse ? grid[0].length - 1 : 0;
    innerMeta.end = isReverse ? 0 : grid[0].length - 1;
  } else {
    //outer === col, inner === row
    outerMeta.start = isReverse ? grid[0].length - 2 : 1; //skip the first row/col on the outer
    outerMeta.end = isReverse ? 0 : grid[0].length - 1;
    innerMeta.start = isReverse ? grid.length - 1 : 0;
    innerMeta.end = isReverse ? 0 : grid.length - 1;
  }

  const forLoop = (meta: GridCoordMeta, action: (coordOuter: number) => void) => {
    let coord = meta.start;
    while ((meta.delta > 0) ? coord <= meta.end : coord >= meta.end) {
      action(coord);
      coord += meta.delta;
    }
  }

  const getCoords = (outer: number, inner: number): [row: number, col: number] => {
    return isVertical ? [outer, inner] : [inner, outer];
  }

  forLoop(outerMeta, (outer) => {
    forLoop(innerMeta, (inner) => {
      const [row, col] = getCoords(outer, inner);
      if (working[row][col] === roundRock) {
        moveRoundRock(working, row, col, isVertical, isReverse);
      }  
    });
  })

  return working;
}

