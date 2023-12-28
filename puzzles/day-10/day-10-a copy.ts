import { ArrayBound, NamedArrayBound, arrayHelpers } from '../../helpers/arrayHelpers.ts';
import { Nullable, isNotNullable } from '../../helpers/nullable.type.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();


const tileList = ['|','-','L','J', '7', 'F', '.', 'S'] as const;
type Tile = typeof tileList[number];

type Coordinates = {row: number, col: number};
function coordinateDelta(start: Coordinates, rowDelta: number, colDelta: number) {
  return {row: start.row + rowDelta, col: start.col + colDelta};
}
function coordsEqual(a: Coordinates, b: Coordinates): boolean {
  return a && b && a.row === b.row && a.col === b.col;
}

interface ICoordinateScope { maxRowIndex: number, maxColIndex: number, isInBounds(coord: Coordinates): boolean };
class CoordinateScope implements ICoordinateScope {
  maxRowIndex: number = NaN;
  maxColIndex: number = NaN;

  isValid(): boolean {
    return !isNaN(this.maxRowIndex) && !isNaN(this.maxColIndex);
  }
  isInBounds(coord: Coordinates): boolean {
    return this.isValid() 
      && coord.row >= 0 && coord.row <= this.maxRowIndex
      && coord.col >= 0 && coord.col <= this.maxColIndex;
  }

  static createFrom(grid: unknown[][]): CoordinateScope {
    const ret = new CoordinateScope();
    if (Array.isArray(grid) && grid.length > 0) {
      ret.maxRowIndex = grid.length-1;
      ret.maxColIndex = grid[0].length-1;
    }
    return ret;
  }
}


class Pipe {
  tile: Tile;
  next: Nullable<Pipe>;
  prev: Nullable<Pipe>;

  coord: Coordinates;

  constructor(tile: Tile, coord: Coordinates, from?: Nullable<Pipe>) { 
    this.tile = tile; 
    this.coord = {...coord}; //copy
    this.prev = from;
  }


  path(): Coordinates[] {
    return [
      this.coord,
      ...this.next?.path()
    ];
  }

  find(coord: Coordinates): Nullable<Pipe>;
  find(row: number, col: number): Nullable<Pipe>;
  find(rowOrCoord: number | Coordinates, col?: number): Nullable<Pipe> {
    const row: number = typeof(rowOrCoord) === 'number' ? rowOrCoord : rowOrCoord.row;
    col = typeof(rowOrCoord) === 'number' ? col : rowOrCoord.col;

    let pipe: Nullable<Pipe> = this;
    while(isNotNullable<Pipe>(pipe) && !coordsEqual(pipe.coord, {row, col})) {
      pipe = pipe.next;
    }

    return (isNotNullable<Pipe>(pipe) && coordsEqual(pipe.coord, {row, col})) ? pipe : null;
  }

  possibleConnectors(scope: ICoordinateScope): Coordinates[] {
    const ret: Coordinates[] = [];

    switch(this.tile) {
      case '-': 
        ret.push(coordinateDelta(this.coord, 0, -1));
        ret.push(coordinateDelta(this.coord, 0, 1));
        break;
      case '7':
        ret.push(coordinateDelta(this.coord, 0, -1));
        ret.push(coordinateDelta(this.coord, 1, 0));
        break;
      case 'F':
        ret.push(coordinateDelta(this.coord, 0, 1));
        ret.push(coordinateDelta(this.coord, 1, 0));
        break;
      case 'J':
        ret.push(coordinateDelta(this.coord, 0, -1));
        ret.push(coordinateDelta(this.coord, -1, 0));
        break;
      case 'L':
        ret.push(coordinateDelta(this.coord, 0, 1));
        ret.push(coordinateDelta(this.coord, -1, 0));
        break;
      case '|':
        ret.push(coordinateDelta(this.coord, -1, 0));
        ret.push(coordinateDelta(this.coord, 1, 0));
        break;
      case 'S':
        ret.push(coordinateDelta(this.coord, 0, -1));
        ret.push(coordinateDelta(this.coord, 0, 1));
        ret.push(coordinateDelta(this.coord, -1, 0));
        ret.push(coordinateDelta(this.coord,  1, 0));
        break;
      case '.':
        //nothing
        break;
      default: 
        throw new Error("Unknown tile symbol: " + this.tile);
    }

    //remove any coordinates that are not valid (outside the map's scope);
    return ret.filter(coord => scope.isInBounds(coord) && (!this.prev || !coordsEqual(coord, this.prev.coord)));
  }

}

class Map {
  pipes: Pipe[][] = [];
  get scope(): CoordinateScope {
    return CoordinateScope.createFrom(this.pipes);
  }

  constructor(tiles: Tile[][]) {
    this.pipes = tiles.map((tileRow, row) => {
      return tileRow.map((tile, col) => {
        return new Pipe(tile, {row, col});
      })
    });
  }

  find(coord: Coordinates): Nullable<Pipe>;
  find(row: number, col: number): Nullable<Pipe>;
  find(rowOrCoord: number | Coordinates, col?: number) {
    const row: number = typeof(rowOrCoord) === 'number' ? rowOrCoord : rowOrCoord.row;
    col = typeof(rowOrCoord) === 'number' ? col : rowOrCoord.col;

    if (this.scope.isInBounds({row,col})) {
      const ret = this.pipes[row][col];
      //validate
      if (ret.coord.row !== row || ret.coord.col !== col) {
        throw new Error(`Error - there is a problem with the Map - found pipe in (row: ${row}, col: ${col}) but it's coordinates are (row: ${ret.coord.row}, col: ${ret.coord.col})`);
      }
      return ret;
    }

    //else
    return null;
  }

  filter(tile: Tile): Pipe[] {
    return this.pipes.flat(2).filter(m => m.tile === tile);
  }

  tiles(): Tile[][] {
    return this.pipes.map(row => row.map(pipe => pipe.tile));
  }

  clone(): Map {
    return new Map(this.tiles());
  }


}


class Loop {
  start: Nullable<Pipe>;

  constructor(start?: Nullable<Pipe>) {
    this.start = start;
  }


  isValid() {
    const path = this.getPath();
    return path.length > 1 && arrayHelpers.getValue('last', path).tile === 'S';
  }


  getPath(): Pipe[] {
    const path = [];
    let current = this.start;
    while (isNotNullable(current) && (current !== this.start || path.length === 0)) {
      path.push(current);
      current = current.next;
    }
    return path;
  }

  stepsToFurthestPoint(): number {
    return Math.ceil(this.getPath().length / 2);
  }

  static findStart(map: Map): Nullable<Pipe> {
    let possible = map.filter('S');
    if (possible.length > 0) {
      return possible[0];
    }
    return null;
  }

  static build(map: Map): Loop {
    const loop = new Loop();
    const checked: Pipe[] = [];
    const alreadyVisited = (coord: Coordinates) => {
      return checked.some(p => coordsEqual(p.coord, coord));
    }

    verbose.add(`build - scope: (${map.scope.maxRowIndex}, ${map.scope.maxColIndex}) - ${map.scope.isValid()}`).display();

    const startLocation = this.findStart(map);
    if (startLocation) {

      loop.start = startLocation;

      const traverseToStart = (start: Pipe, current: Pipe): boolean => {
        // if (checked.find(p => coordsEqual(p.coord, current.coord))) { return false; } // already traversed

        const routes = current.possibleConnectors(map.scope);
        verbose.display();
        verbose.add(`traverseToStart from ${current.tile} (${current.coord.row},${current.coord.col}) with ${routes.length} routes`).display();
        let found: boolean = false;
        for (let i = 0; i < routes.length && !found; i++) {
          const route = routes[i];
          verbose.add(`Checking route (${route.row},${route.col}) [visited: ${alreadyVisited(route)}]... `);
          //if the route has not already been visited (is in the loop)
          if (!alreadyVisited(route)) {
            const pipe = map.find(route);
            verbose.add(`adding ${pipe?.tile ?? 'n/a'}`);
            //info: not valid if pipe's connector cannot connect back to current
            if (pipe && pipe.possibleConnectors(map.scope).some(c => coordsEqual(c, current.coord))) {
              checked.push(pipe);
              pipe.prev = current;
              current.next = pipe;
              found = pipe.tile === 'S' || traverseToStart(start, pipe);
            }
          } else {
            verbose.add(`ignoring`);
          }
          verbose.display();
        }
  
        if (!found) {
          checked.push(current);
        }

        verbose.add(`${current.tile} is DONE`).display();
        return found;
      }
  
      const result = traverseToStart(loop.start, loop.start);
      console.log("build", result, loop.getPath().map(p => p.tile));
    }

    return loop;
  }


  
}



export async function day10a(dataPath?: string) {
  const data = await readData(dataPath);
  const map = new Map(data.map(row => row.split('').map(col => col as Tile)));
  const loop = Loop.build(map);


  let total = loop.stepsToFurthestPoint();
  
  return total;
}

const answer = await day10a();
outputHeading(9, 'a');
outputAnswer(answer);
