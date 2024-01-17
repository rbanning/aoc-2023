import { Direction } from "./direction.ts";

export const emptySpace = '.';
export const mirrorLeft = '\\';   //note: need to escape 
export const mirrorRight = '/';
export const splitterV = '|';
export const splitterH = '-';

export const empty = [emptySpace] as const;
export const mirrors = [mirrorLeft, mirrorRight] as const;
export const splitters = [splitterH, splitterV] as const;

export type EmptySpace = typeof empty[number];
export type Mirror = typeof mirrors[number];
export type Splitter = typeof splitters[number];

export type TileType = EmptySpace | Mirror | Splitter;
export type GridTile =  { type: TileType, beams: number, directions: Direction[] };

export type Grid = GridTile[][];