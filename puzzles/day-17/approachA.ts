import { Coordinate, coordsEqual } from "../../helpers/coordinate.ts";
import { Grid, GridRoute, RoutePoint, findLowestTotalCost, removeFromGridRoute, searchGrid, searchGridRoute } from "./common.ts";

export const buildGrid = (input: string[][]): Grid => {
  return input.map((line, r) => {
    return line.map((cell, c) => {
      return new RoutePoint(r, c, cell);
    })
  })
}

// find shortest route using A* (A-Star) approach
export const findShortestRoute = (grid: Grid, start: Coordinate, end: Coordinate): GridRoute => {
  const openSet: GridRoute = [];
  const closedSet: GridRoute = [];
  const route: GridRoute = [];

  const startPoint = searchGrid(start, grid);

  //init
  openSet.push(startPoint);

  while(openSet.length > 0) {
    const currentPoint = findLowestTotalCost(openSet);

    //if we are at the end, great.... 
    if (coordsEqual(currentPoint.coord, end)) {
      return currentPoint.path;
    }

    //move currentPoint from open to closed, and process each of its options (neighbors)
    removeFromGridRoute(currentPoint.coord, openSet);
    closedSet.push(currentPoint);

    //find the "best" next move option
    const options = currentPoint.options(grid, closedSet);
    for (let i = 0; i < options.length; i++) {
      const neighbor = searchGrid(options[i], grid);

      //only proceed if neighbor is NOT in the closed list
      if (!closedSet.find(p => coordsEqual(neighbor.coord, p.coord))) {


        let gScore = currentPoint.costFromStart + 1;
        let gScoreIsBest = false;

        if (!searchGridRoute(neighbor.coord, openSet)) {
          // first time at this node
          gScoreIsBest = true;
          openSet.push(neighbor);
        } else if (gScore < neighbor.costFromStart) {
          // distance is best (so far)
          gScoreIsBest = true;
        }
        
        if (gScoreIsBest) {
          neighbor.costFromStart = currentPoint.costFromStart + neighbor.heatLoss; //update
          neighbor.calcEstimatedCostToEnd(end);
          neighbor.parent = currentPoint;
        }
      }
      
    } //end for each option (neighbor)
  }   //end while openSet has items

  //no solution
  return [];
}

