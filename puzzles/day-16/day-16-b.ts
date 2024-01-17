import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { generateStartingPoints, initializeGrid, traverseGrid } from './approach-B.ts';
import { Grid } from './common.ts';
import { Coordinate, CoordinateDelta, deltaDirection } from './direction.ts';

Verbose.setActive(true);
const verbose = new Verbose();

type Max = {
  coord?: Coordinate,
  delta?: CoordinateDelta,
  grid?: Grid,
  total: number,
}

function parseData(data: string[]): string[][] {
  return data.map(m => m.split(''));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.map(tile => { return {...tile}; }));
}

function resetGrid(grid: Grid): Grid {
  return grid.map(row => {
    return row.map(tile => {
      tile.directions = []; //reset;
      tile.beams = 0;       //reset;
      return tile;
    });
  })
}

export async function day16b(dataPath?: string) {
  const data = await readData(dataPath);
  let grid = initializeGrid(parseData(data));
  const max: Max = {
    total: 0
  }

  const startingPoints = generateStartingPoints(grid);
  for (let i = 0; i < startingPoints.length; i++) {
    const {coord, delta} = startingPoints[i];
    grid = resetGrid(grid);

    traverseGrid(grid, coord, delta);
    const total = grid.reduce((sum, row) => {
      sum += row.filter(t => t.beams > 0).length;
      return sum;
    }, 0);

    if (total > max.total) {
      max.total = total;
      max.coord = coord;      
      max.delta = delta;
      max.grid = cloneGrid(grid);
    }
  }

  verbose.add(`Max was found entering at [${max.coord[0]},${max.coord[1]}] and heading ${deltaDirection(max.delta)}`).display();
  max.grid.forEach(row => {
    row.forEach(tile => verbose.add(tile.beams > 0 ? '#' : '.'));
    verbose.display();
  });



  return max.total;
}

const answer = await day16b();
outputHeading(16, 'b');
outputAnswer(answer);
