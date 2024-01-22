import { Coordinate, coordInRange, coordsEqual } from "../../helpers/coordinate.ts";
import { Nullable } from "../../helpers/nullable.type.ts";

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
    return coordInRange([r,c], grid.length, grid[r].length)
      && !alreadyVisited.some(r => coordsEqual(from, r.coord));
  });

  return moveOptionsFilterByRoute(options, currentRoute, maxInDirection);
}

function moveOptionsFilterByRoute(options: Coordinate[], route: GridRoute, maxInDirection) {
  const last = options.slice(-1*maxInDirection);  //get the last three route points

  //no need to check if we have not gone maxInDirection (three) steps
  if (last.length < maxInDirection) { return options; }

  const first = last[0]; //first in the list
  const checkRows = last.every(c => c[0] === first[0]); //every row is equal
  const checkCols = !checkRows && last.every(c => c[1] === first[1]); //every col is equal (shortcut if we need to check rows)

  //no need to check if we have not been traveling in a straight line for maxInDirection steps 
  if (!checkRows && !checkCols) { return options; }

  //else
  return options.filter(c => {
    if (checkRows) {
      return c[0] !== first[0];
    } else if (checkCols) {
      return c[1] !== first[1];
    }
    //else
    return true;
  })
}

//#endregion (helpers)