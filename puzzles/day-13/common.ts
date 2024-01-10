import { isNotNullable, isNullable } from "../../helpers/nullable.type.ts";
import { Verbose } from "../../shared.ts";

export const ROCK = '#';
export const ASH = '.';
export const patternChars = [ROCK, ASH] as const;
export type PatternChar = typeof patternChars[number];

export type ReflectionType = 'vertical' | 'horizontal';
export type ReflectionIndices = [a: number, b: number];
export type Grid = PatternChar[][];

export type MirrorPattern = {
  grid: Grid,
  type?: ReflectionType,
  indices?: ReflectionIndices,
}

export function displayGrid(grid: Grid) {
  if (Verbose.isActive()) {
    const v = new Verbose();
    v.add(`  ${grid[0].map((_, index) => index).join('')}`).display();
    grid.forEach((row, index) => v.add(`${index} ${row.join('')}`).display());
  }
}

export function deltaInRows(grid: Grid, indexA: number, indexB: number, threshold?: number): number {
  const rowA = grid[indexA]; 
  const rowB = grid[indexB];
  return calcDelta(rowA, rowB, threshold);
}

export function deltaInCols(grid: Grid, indexA: number, indexB: number, threshold?: number): number {
  const colA = grid.map(g => g[indexA]); 
  const colB = grid.map(g => g[indexB]);
  return calcDelta(colA, colB, threshold);
}

function calcDelta(a: PatternChar[], b: PatternChar[], threshold?: number): number {
  if (a.length !== b.length) { return -1; } //flag error
  let ret = 0;
  for (let index = 0; index < a.length && (isNullable(threshold) || ret <= threshold); index++) {
    if (a[index] !== b[index]) { ret += 1; }
  }
  return ret;
}

