export type Coordinate = [ row: number, col: number ];

export const coordsEqual = (a: Coordinate, b: Coordinate) => {
  return a[0] === b[0] && a[1] === b[1];
}

export const coordInRange = (coord: Coordinate, rowLength: number, colLength: number) => {
  const [row,col] = coord;
  return row >= 0 && row < rowLength
    && col >= 0 && col < colLength;
}