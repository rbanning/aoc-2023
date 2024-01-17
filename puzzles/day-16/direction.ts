export type Coordinate = [ row: number, col: number ];
export type CoordinateDelta = [ deltaRow: number, deltaCol: number ];
export type Direction = 'N' | 'E' | 'W' | 'S';

export function deltaDirection(delta: CoordinateDelta): Direction {
  const [deltaRow, deltaCol] = delta;
  if (deltaRow !== 0 && deltaCol !== 0) { throw new Error(`Invalid delta coordinate [${deltaRow},${deltaCol}] - one must be 0 or else it is diagonal (not allowed)`); }
  if (deltaRow !== 0) {
    //vertical
    return deltaRow < 0 ? 'N' : 'S';
  }
  //else horizontal
  return deltaCol < 0 ? 'W' : 'E';
}
