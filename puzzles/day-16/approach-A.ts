import { GridTile, TileType, Grid, emptySpace, splitterH, splitterV, mirrorLeft, mirrorRight, mirrors, splitters } from "./common.ts";
import { Coordinate, CoordinateDelta, deltaDirection } from "./direction.ts";


export function initializeGrid(input: string[][]): Grid {
  return input.map(row => row.map(tile => {
    return {
      type: tile as TileType,
      beams: 0,
      directions: []
    } as GridTile
  }));
}


export function traverseGrid(grid: Grid, coord: Coordinate, delta: CoordinateDelta) {
  const [row, col] = coord;
  
  
  //only proceed if valid row/col
  if (row >= 0 && row < grid.length 
    && col >= 0 && col < grid[row].length) {
      
      const [deltaRow, deltaCol] = delta;
      const tile = grid[row][col];
      const direction = deltaDirection(delta);
      
      //only proceed if we have not already visited this tile in the current direction (i.e. we don't want to loop)
      if (!tile.directions.includes(direction)) {
        tile.directions.push(direction);    //record direction
        tile.beams++;                       //energize

        if (isPassthrough(tile.type, delta)) {
          //continue in the direction you are heading...
          traverseGrid(grid, [row+deltaRow, col+deltaCol], delta);
        } else if (mirrors.some(m => m === tile.type)) {
          //reflect 90 degrees
          delta = reflect90(tile.type, delta);
          traverseGrid(grid, [row+delta[0], col+delta[1]], delta);
        } else if (splitters.some(s => s === tile.type)) {
          const [deltaA, deltaB] = splitBeam(tile.type, delta);
          traverseGrid(grid, [row+deltaA[0], col+deltaA[1]], deltaA);
          traverseGrid(grid, [row+deltaB[0], col+deltaB[1]], deltaB);
        }
      }
  }

}

function isPassthrough(type: TileType, delta: CoordinateDelta) {
  const direction = deltaDirection(delta);
  return type === emptySpace
    || (type === splitterH && (direction === 'E' || direction === 'W'))
    || (type === splitterV && (direction === 'N' || direction === 'S'));
}


function reflect90(type: TileType, currentDelta: CoordinateDelta): CoordinateDelta {
  const direction = deltaDirection(currentDelta);
  switch(type) {
    case mirrorLeft:  //  '\'
      switch (direction) {
        case 'N':
          return [0, -1]; //move left          
        case 'S':
          return [0, 1]; //move right
        case 'E': 
          return [1, 0]; //move down
        case 'W':
          return [-1, 0];  //move up
      }
      break;
    case mirrorRight: //    '/'
      switch (direction) {
        case 'N':
          return [0, 1]; //move right          
        case 'S':
          return [0, -1]; //move left
        case 'E': 
          return [-1, 0]; //move up
        case 'W':
          return [1, 0];  //move down
      }
      break;
    default: 
      return currentDelta; //continue
  }
}

function splitBeam(type: TileType, currentDelta: CoordinateDelta): [CoordinateDelta, CoordinateDelta] {
  const direction = deltaDirection(currentDelta);
  if (type === splitterH && (direction === 'S' || direction === 'N')) {
    return [ [0, -1], [0, 1] ]; //right and left
  } else if (type === splitterV && (direction === 'E' || direction === 'W')) {
    return [ [-1, 0], [1, 0] ]; //up and down
  }
  //else ... should not call splitBeam 
  throw new Error(`Unable to split beam with type = '${type}' and direction = '${direction}'`);
}