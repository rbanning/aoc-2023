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


