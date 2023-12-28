import { arrayHelpers } from "../../helpers/arrayHelpers.ts";
import { Nullable } from "../../helpers/nullable.type.ts";
import { Verbose } from "../../shared.ts";
import { Coordinate, CoordinateScope } from "./coordinates.ts";
import { Tile, Pipe, startTile } from "./pipe.ts";

export class PipeMap {
  pipes: Pipe[][] = [];
  scope: CoordinateScope;
  startPipe: Nullable<Pipe>;
  startCoord: Nullable<Coordinate>;

  constructor(tiles: Tile[][]) {
    this.pipes = tiles.map((tileRow, row) => {
      return tileRow.map((tile, col) => {
        return new Pipe(tile, new Coordinate(row, col));
      })
    });
    this.scope = CoordinateScope.createFrom(this.pipes);
    this.startPipe = this.flatten().find(p => p.tile === startTile);
    if (this.startPipe) {
      this.startCoord = this.startPipe.coord.clone();
    }
  }

  resetPipeConnectors() {
    this.pipes.forEach(row => {
      row.forEach(p => { p.resetConnections(); });
    });
  }

  find(coord: Coordinate): Nullable<Pipe>;
  find(row: number, col: number): Nullable<Pipe>;
  find(rowOrCoord: number | Coordinate, col?: number) {
    const row: number = typeof(rowOrCoord) === 'number' ? rowOrCoord : rowOrCoord.row;
    col = typeof(rowOrCoord) === 'number' ? col : rowOrCoord.col;

    if (this.scope.isInBounds({row,col})) {
      const ret = this.pipes[row][col];
      //validate
      if (!ret.coord.equals({row, col})) {
        throw new Error(`Error - there is a problem with the Map - found pipe in (row: ${row}, col: ${col}) but it's coordinates are (row: ${ret.coord.row}, col: ${ret.coord.col})`);
      }
      return ret;
    }

    //else
    return null;
  }

  flatten(): Pipe[] {
    return this.pipes.flat(2);
  }

  filter(tile: Tile): Pipe[] {
    return this.flatten().filter(m => m.tile === tile);
  }

  tiles(): Tile[][] {
    return this.pipes.map(row => row.map(pipe => pipe.tile));
  }

  clone(): PipeMap {
    return new PipeMap(this.tiles());
  }

  calculateArea(start: Pipe, includeVerbose: boolean = false): number {
    const verbose = new Verbose();

    let current = start;
    let sum = 0;
    const coords = start.path();
    if (includeVerbose) {
      verbose.add(`Calculate Area of polygon formed by ${coords.length} nodes`).display();
      verbose.add(coords.map(c => c.toString(true)).join(", ")).display();
    }
    let done = false;
    while(current) {
      const a = current.coord;
      const b = !current.next ? start.coord : current.next.coord;
      if (includeVerbose) {
        verbose.add(`a:${a.toString(true)} b:${b.toString(true)} ... `);
        verbose.add(`+= (${a.col}*${b.row}) - (${a.row}*${b.col})`);
        verbose.add(` = (${a.col*b.row}) - (${a.row*b.col})`);
        verbose.add(` = ${(a.col*b.row) - (a.row*b.col)}`);
        verbose.display();
      }
      sum += (a.col*b.row) - (a.row*b.col);
      current = current.next;
    }
    if (includeVerbose) {
      verbose.add(`sum = ${sum} and Area = ${Math.abs(sum)/2}`).display();
    }
    return Math.abs(sum) / 2;
  }

  displayGrid(start: Pipe): {body: string[], header: string[], footer: string[]} {
    const ret = {
      body: [] as string[],
      header: [] as string[],
      footer: [] as string[]
    };
    const path = start.path();
    ret.header.push(`output of ${this.scope.maxRowIndex+1} x ${this.scope.maxColIndex+1} (${path.length} nodes)`);
    ret.header.push(arrayHelpers.create(this.scope.maxColIndex+1, '─').join(''));
    for (let row = 0; row <= this.scope.maxRowIndex; row++) {
      const output: string[] = [];
      for (let col = 0; col <= this.scope.maxColIndex; col++) {
        const coord = new Coordinate(row, col);
        const pipe = this.find(coord);
        if (!pipe) { throw new Error(`Invalid row/col ${coord.toString()}`); }
        if (pipe.coord.equals(start.coord)) { 
          output.push('S');
        } else if (coord.isIn(path)) {
          output.push(pipe.boxSymbol);         
        } else {
          output.push(' ');
        }
      }
      if (!output.every(p => p === ' ')) {
        ret.body.push(output.join(''));
      }
    }
    ret.footer.push(arrayHelpers.create(this.scope.maxColIndex+1, '─').join(''));
    
    return ret;
  }
  
}
