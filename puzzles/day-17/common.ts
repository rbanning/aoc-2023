import { Coordinate, coordInRange, coordsEqual } from "../../helpers/coordinate.ts";
import { Nullable } from "../../helpers/nullable.type.ts";
import { Verbose } from "../../shared.ts";

export class RoutePoint {
  coord: Coordinate;
  get row() { return this.coord[0]; }
  get col() { return this.coord[1]; }

  heatLoss: number;
  parent: Nullable<RoutePoint>;

  get path() {
    const ret: RoutePoint[] = [];
    let current: RoutePoint = this;
    ret.push(current);
    while (current.parent) {
      ret.push(current.parent);
      current = current.parent;
    }
    return ret.reverse();
  }

  constructor (row: number, col: number, heatLoss: string | number) {
    this.coord = [row, col];
    this.heatLoss = typeof(heatLoss) === 'string' ? parseInt(heatLoss) : heatLoss;
    this.costFromStart = this.heatLoss;
  }

  is(target: Coordinate) { return coordsEqual(this.coord, target); }

  // g: number ... actual cost to start
  costFromStart: number;

  // h: number ... estimate (heuristic) cost to end
  estimatedCostToEnd: number = 0;
  calcEstimatedCostToEnd(end: Coordinate): number {
    this.estimatedCostToEnd = distanceHeuristic(this.coord, end);
    return this.estimatedCostToEnd;
  }

  // f: number ... total cost start to end though point 
  get totalCostStartToEnd() { return this.costFromStart + this.estimatedCostToEnd; }

  options(grid: Grid, alreadyVisited: GridRoute, maxInDirection: number = 3) {
    return moveOptions(grid, this.coord, alreadyVisited, this.path, maxInDirection);
  }

}
export type Grid = RoutePoint[][];
export type GridRoute = RoutePoint[];


export function searchGrid(coord: Coordinate, grid: Grid) { 
  const [row, col] = coord;
  return grid[row][col];
}
export function searchGridRoute(coord: Coordinate, gridRoute: GridRoute) { 
  return gridRoute.find(p => coordsEqual(p.coord, coord));
}
export function isInGridRoute(coord: Coordinate, gridRoute: GridRoute) {
  return gridRoute.some(p => coordsEqual(coord, p.coord));
}
export function removeFromGridRoute(coord: Coordinate, gridRoute: GridRoute) {
  const index = gridRoute.findIndex(p => coordsEqual(coord, p.coord));
  if (index >= 0) {
    gridRoute.splice(index, 1);
  }
  return gridRoute;
}

export function findLowestTotalCost(route: GridRoute) {
  if (route.length === 0) { throw new Error(`Cannot find lowest total cost in GridRoute when there are no points in the GridRoute.  (GridRoute length === 0)`); }
  let lowestIndex = 0;
  let currentIndex = 1;
  while (currentIndex < route.length) {
    if (route[currentIndex].totalCostStartToEnd < route[lowestIndex].totalCostStartToEnd) {
      lowestIndex = currentIndex;
    }
    currentIndex += 1;
  }

  return route[lowestIndex];
}

export function calcTotalCost(route: GridRoute) {
  return route.reduce((sum, p) => sum + p.heatLoss, 0);
}

export function displayGrid(grid: Grid, route?: GridRoute) {
  const leftPad = 6;  
  const lineOf = (char: string, length: number) => {
    return new Array(length)
      .fill(char)
      .join('');
  }
  const direction = (a: Coordinate, b: Coordinate) => {
    if (a && b) {
      if (a[0] !== b[0]) {
        return a[0] > b[0] ? '^' : 'V';
      } else if (a[1] != b[1]) {
        return a[1] > b[1] ? '<' : '>';
      }
    }

    //else
    return null;
  }

  if (Verbose.isActive()) {
    const verbose = new Verbose();
    //col indices
    verbose.add(lineOf(' ', leftPad));
    for (let i = 0; i < grid[0].length; i++) {
      verbose.add(`${i}`);
    }
    verbose.display();

    //break (dots)
    verbose.add('.'.padStart(leftPad+grid[0].length, '.')).display();
    

    for (let row = 0; row < grid.length; row++) {
      verbose.add(`${row} | `.padStart(leftPad));
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        if (route && isInGridRoute(cell.coord, route)) {
          verbose.add(direction(cell.parent?.coord, cell.coord) ?? `#`);
        } else {
          verbose.add(`${cell.heatLoss}`);
        }
      }
      verbose.display();
    }
  }
}

export function displayGridRoute(route: GridRoute) {
  if (Verbose.isActive()) {
    const verbose = new Verbose();
    route.forEach((p, index) => {
      if (index > 0) {
        verbose.add(' --> ');
      }
      verbose.add(`[${p.row},${p.col}](${p.heatLoss})`);
    });
    verbose.display();
  }
}
//#region --- HELPERS ----



//estimate of the cost to go from a to b
function distanceHeuristic(coord1: Coordinate, coord2: Coordinate): number {
  //Manhattan distance  (https://simple.wikipedia.org/wiki/Manhattan_distance)
  //assume can only move up/down, right/left (no diag)
  const [row1, col1] = coord1; 
  const [row2, col2] = coord2; 

  return Math.abs(row1 - row2) + Math.abs(col1 - col2); 
}




function moveOptions (grid: Grid, from: Coordinate, alreadyVisited: GridRoute, currentRoute: GridRoute, maxInDirection: number = 3): Coordinate[] {
  const [row, col] = from;
  const options = [
    [row, col+1] as Coordinate,
    [row, col-1] as Coordinate,
    [row+1, col] as Coordinate,
    [row-1, col] as Coordinate
  ].filter(([r,c]) => {
    return coordInRange([r,c], grid.length, grid[0].length)
      && !isInGridRoute([r,c], alreadyVisited);
  });

  return moveOptionsFilterByRoute(options, currentRoute, maxInDirection);
}

function moveOptionsFilterByRoute(options: Coordinate[], route: GridRoute, maxInDirection) {
  const endGroup = route.slice(-1*maxInDirection);  //get the last three route points

  //no need to check if we have not gone maxInDirection (three) steps
  if (endGroup.length < maxInDirection) { return options; }

  const rows = endGroup.map(p => p.row);
  const cols = endGroup.map(p => p.col);

  const checkRows = rows.every(r => r === rows[0]); //every row is equal
  const checkCols = cols.every(c => c === cols[0]); //every col is equal 
  
  
  //no need to check if we have not been traveling in a straight line for maxInDirection steps 
  if (!checkRows && !checkCols) { return options; }
  
  //else
  const result = options.filter(c => {
    if (checkRows) {
      return c[0] !== rows[0];
    } else if (checkCols) {
      return c[1] !== cols[0];
    }
    //else
    return true;
  });
  
  new Verbose().add(`filtering (${options.length}) options (${options.map(o => `[${o[0]},${o[1]}]`).join(' ')}) to (${result.length})  (${result.map(o => `[${o[0]},${o[1]}]`).join(' ')})  ... (${endGroup.map(p => `[${p.row},${p.col}]`).join(' ')}) rows: ${checkRows}, cols: ${checkCols}`).display();
  return result;
}

//#endregion (helpers)