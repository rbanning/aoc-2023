import { Nullable } from "../../helpers/nullable.type.ts";
import { Coordinate, CoordinateScope } from "./coordinates.ts";

export type StartTile = 'S';
export const startTile: StartTile =  'S';
export type EmptyTile = '.';
export const emptyTile: EmptyTile =  '.';
export const tileList = ['|','-','L','J', '7', 'F'] as const;
export type Tile = typeof tileList[number] | StartTile | EmptyTile;

export const tileTranslator: {[key in Tile]?: string} = {
  '-': '─',
  '|': '│',
  '7': '┐',
  'F': '┌',
  'J': '┘',
  'L': '└'
}

export class Pipe {
  private _tile: Tile;
  get tile(): Tile { return this._tile; }
  set tile(value: Tile) { 
    this._tile = value;
    this.possibleConnectors = value === startTile ? [] : this._findPossibleConnectors();
  }
  next: Nullable<Pipe>;
  prev: Nullable<Pipe>;

  coord: Coordinate;
  possibleConnectors: Coordinate[];

  isStart: boolean;
  isPartOfLoop: boolean = false;
  get boxSymbol() {
    return tileTranslator[this.tile] ?? '?';
  }

  constructor(tile: Tile, coord: Coordinate, from?: Nullable<Pipe>) { 
    this.coord = coord.clone();
    this.prev = from;
    this.isStart = tile === startTile;
    this.tile = tile; //assign last - triggers _findPossibleConnectors
  }

  resetConnections() {
    this.next = null;
    this.prev = null;
    this.isPartOfLoop = false;
  }

  //will be a single coordinate unless the .prev has not been set
  connectsTo(scope: CoordinateScope): Coordinate[] {
    return this.possibleConnectors.filter(coord => scope.isInBounds(coord) && (!this.prev || !this.prev.coord.equals(coord)));
  }

  //checks if pipe's coord is in possibleCoords
  //  and if our coord is in the pipe's possibleCoords
  //  and the pipe is not our previous 
  canConnectTo(pipe: Pipe) {
    return this.coord.isIn(pipe.possibleConnectors)
      && pipe.coord.isIn(this.possibleConnectors)
      && (!this.prev || !this.prev.coord.equals(pipe.coord));
  }

  path(): Coordinate[] {
    const ret: Coordinate[] = [];
    let current: Nullable<Pipe> = this;
    while (current && (!current.isStart || ret.length === 0)) {
      ret.push(current.coord);
      current = current.next;
    }
    return ret;
  }

  //returns all possible connector coordinates (within bounds) 
  private _findPossibleConnectors(): Coordinate[] {
    const ret: Coordinate[] = [];

    switch(this.tile) {
      case '-': 
        ret.push(this.coord.delta(0, -1));
        ret.push(this.coord.delta(0, 1));
        break;
      case '7':
        ret.push(this.coord.delta(0, -1));
        ret.push(this.coord.delta(1, 0));
        break;
      case 'F':
        ret.push(this.coord.delta(0, 1));
        ret.push(this.coord.delta(1, 0));
        break;
      case 'J':
        ret.push(this.coord.delta(0, -1));
        ret.push(this.coord.delta(-1, 0));
        break;
      case 'L':
        ret.push(this.coord.delta(0, 1));
        ret.push(this.coord.delta(-1, 0));
        break;
      case '|':
        ret.push(this.coord.delta(-1, 0));
        ret.push(this.coord.delta(1, 0));
        break;
      case 'S':
        throw new Error('You need to substitute the S tile for one of the valid connecting tiles');
      case '.':
        //nothing
        break;
      default: 
        throw new Error("Unknown tile symbol: " + this.tile);
    }

    return ret;
  }

  toString() {
    return `[${this.coord.row},${this.coord.col}] ${this.tile}`;
  }
}
