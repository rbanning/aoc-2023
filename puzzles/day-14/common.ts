import { Verbose } from "../../shared.ts";
import { Direction, isReverseDirection, isVerticalDirection, north, south } from "./direction.ts";


export const roundRock = 'O';
export const squareRock = '#';
export const emptySpace = '.';
export const charTypes = [roundRock, squareRock, emptySpace] as const;
export type CharType = typeof charTypes[number];

export type CharRow = CharType[];
export type Grid = CharRow[];

export type GridCoordMeta = {
  count: number,
  start: number,
  end: number,
  delta: number,
}
export type GridMeta = {
  row: GridCoordMeta,
  col: GridCoordMeta,
} 


export function arrayValue(arr: CharRow, index: number, totalNumberOfArrays: number, direction: Direction);
export function arrayValue(row: CharRow, index: number, totalNumberOfArrays: number, reverse: boolean);
export function arrayValue(row: CharRow, index: number, totalNumberOfArrays: number, reverse: boolean|Direction) {
  reverse = typeof(reverse) === 'string' 
    ? isReverseDirection(reverse)
    : reverse === true;

  return countOf(roundRock, row) * (reverse ? (index + 1) : (totalNumberOfArrays - index));  
}

export function countOf(char: CharType, area: CharType[]): number {
  if (Array.isArray(char)) {
    return area.reduce((sum, ch) => sum + (char.includes(ch) ? 1 : 0), 0);
  }
  //else ... only one char
  return area.reduce((sum, ch) => sum + (ch === char ? 1 : 0), 0);
}

export function cloneGrid(grid: Grid) {
  return grid.map(row => [...row]);
}


export function moveRoundRock(grid: Grid, row: number, col: number, direction: Direction)
export function moveRoundRock(grid: Grid, row: number, col: number, isVertical: boolean, isReverse: boolean);
export function moveRoundRock(grid: Grid, row: number, col: number, dirOrVert: Direction | boolean, isReverse?: boolean) {
  if (grid[row][col] !== roundRock) { throw new Error(`Oops, cannot move '${grid[row][col]}' at [${row},${col}] -- it is not a rounded rock`); }
  
  const isVertical = typeof(dirOrVert) === 'string' ? isVerticalDirection(dirOrVert) : dirOrVert === true;
  isReverse = typeof(dirOrVert) === 'string' ? isReverseDirection(dirOrVert) : isReverse === true;

  const delta = isReverse ? 1 : -1;  //move up/left or if reverse, move down/right
  const endIndex = isVertical
    ? (isReverse ? grid.length - 1 : 0) //row - move to top or if reverse, move to bottom
    : (isReverse ? grid[row].length - 1 : 0); //col - move to start or if reverse, move to end
    
  
  // helpers
  const areCoordsOk = () => {
    //NOTE: stopping at the endIndex
    if (isVertical) {
      //only concerned with row
      return delta < 0 ? (row > endIndex) : (row < endIndex); 
    }
    //else... only concerned with col
    return delta < 0 ? (col > endIndex) : (col < endIndex);
  } 

  const isNextEmpty = () => {
    return isVertical 
      ? (grid[row + delta][col] === emptySpace)
      : (grid[row][col + delta] === emptySpace);
  }

  const incrementRowCol = () => {
    if (isVertical) { 
      row += delta;
    } else {
      col += delta;
    }
  }

  const swap = () => {
    //assert current row/col is rounded rock and next is empty
    
    grid[row][col] = emptySpace; 
    incrementRowCol();
    grid[row][col] = roundRock;

  }

  while (areCoordsOk() && isNextEmpty()) {
    swap();
  }
}

export function displayGrid(grid: Grid, direction?: Direction) {
  if (Verbose.isActive()) {
    const verbose = new Verbose();
    let total = 0;
    grid.forEach((row, index) => {
      row.forEach(col => verbose.add(col));
      if (direction) {        
        const value = arrayValue(row, index, grid.length, direction);
        total += value;
        verbose.add(` count: ${countOf(roundRock, row)}, value: ${value}`);
      }
      verbose.display();
    })
    if (direction) {
      verbose.add(`TOTAL: ${total}`).display();
    }
  }
}