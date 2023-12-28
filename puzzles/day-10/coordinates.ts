
export interface ICoordinate {
  row: number;
  col: number; 
};

export class Coordinate implements ICoordinate {
  row: number = NaN;
  col: number = NaN;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  isValid() {
    return !isNaN(this.row) && !isNaN(this.col);
  }

  equals(coord: ICoordinate) {
    return this.isValid() 
      && this.row === coord.row
      && this.col === coord.col;
  }

  isIn(coords: Coordinate[]) {
    return coords.some(c => c.equals(this));
  }

  delta(deltaRow: number, deltaCol: number) {
    return new Coordinate(this.row + deltaRow, this.col + deltaCol);
  }

  clone() {
    return new Coordinate(this.row, this.col);
  }

  toString(xyFormat: boolean = false) {
    if (xyFormat) {
      return this.isValid() ? `(${this.col},${this.row})` : '[n/a]';
    }
    //else [row,col] format
    return this.isValid() ? `[${this.row},${this.col}]` : '[n/a]';
  }

  static createFrom(row: number, col: number): Coordinate;
  static createFrom(coord: ICoordinate): Coordinate;
  static createFrom(rowOrCoord: number | ICoordinate, col?: number): Coordinate {
    if (typeof(rowOrCoord) === 'number') {
      return new Coordinate(rowOrCoord, col);
    }
    //else
    return new Coordinate(rowOrCoord.row, rowOrCoord.col);
  }
}

export interface ICoordinateScope { maxRowIndex: number, maxColIndex: number };
export class CoordinateScope implements ICoordinateScope {
  maxRowIndex: number = NaN;
  maxColIndex: number = NaN;

  isValid(): boolean {
    return !isNaN(this.maxRowIndex) && !isNaN(this.maxColIndex);
  }
  isInBounds(coord: ICoordinate): boolean {
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



