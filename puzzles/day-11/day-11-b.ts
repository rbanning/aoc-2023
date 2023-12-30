import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { Coordinate } from '../day-10/coordinates.ts';
Verbose.setActive(false);
const verbose = new Verbose();

type EmptySpace = '.';
const emptySpace: EmptySpace = '.';
class Galaxy {
  name: string;
  coord: Coordinate;
  get isEmpty() { return this.name === emptySpace; }

  constructor(name: string, coord: Coordinate) {
    this.name = name;
    this.coord = coord;
  }
}

type UniverseUnit = Galaxy | EmptySpace;
type Universe = UniverseUnit[][];

const names = "123456789ABCDEFGHIJKLMNOPQRSTUVWαβγδεζηθικμνξοπρστυφχψω".split('');
const nameAt = (index: number) => { return names[index % names.length]; }
class Map {
  universe: Universe = [];

  //keep track of which rows and columns are empty
  empty = {
    rows: [] as number[],
    cols: [] as number[]
  }

  readonly expansionFactor = 1000000;

  build(data: string[]) {
    this.universe = this.parseData(data);
    if (Verbose.isActive()) {
      verbose.add(`universe is ${this.universe.length} rows by ${this.universe[0].length} columns`).display();
      verbose.add('  '); 
      for (let index = 0; index < this.universe[0].length; index++) {
        verbose.add(`${index}`);
      }
      verbose.display();
      this.universe.forEach((row, rowIndex) => {
        verbose.add(`${rowIndex} ${row.map(m => m === emptySpace ? m : m.name).join('')}`).display();
      });
      verbose.newline().display();
    }
    this.universe = this.expandUniverse(this.universe); 
  }

  shortestPaths(): number[] {
    const paths: number[] = [];
    const galaxies = this.getGalaxies();
    for (let aIndex = 0; aIndex < galaxies.length; aIndex++) {
      const a = galaxies[aIndex];

      for (let bIndex = aIndex+1; bIndex < galaxies.length; bIndex++) {
        const b = galaxies[bIndex];
        paths.push( Math.abs(a.coord.row - b.coord.row) + Math.abs(a.coord.col - b.coord.col) );
      }
    }
    return paths;
  }

  private parseData(data: string[]): Universe  {
    let count = 0;
    return data.map((line, row) => {
      return line.split('')
        .map((ch, col) => {
          if (ch === emptySpace) { return ch; }
          //else
          const galaxy = new Galaxy(nameAt(count), new Coordinate(row,col));
          count += 1;
          return galaxy;
        })
    })
  }
 
  private expandUniverse(uni: Universe): Universe {
    if (!uni || uni.length === 0) { return uni; }


    //get empty rows
    this.empty.rows = uni.map((m, row) => m.every(x => x === emptySpace) ? row : NaN).filter(m => !isNaN(m));

    //get empty columns
    for (let col = 0; col < uni[0].length; col++) {
      if (uni.every(m => m[col] === emptySpace)) {
        this.empty.cols.push(col);
      }
    }

    verbose.add(`Empty Rows: ${this.empty.rows.join(', ')}`).display();
    verbose.add(`Empty Columns: ${this.empty.cols.join(', ')}`).display();

    //update the row/col coord of every galaxy
    for (let r = 0; r < uni.length; r++) {
      for (let c = 0; c < uni[r].length; c++) {
        const unit = uni[r][c];
        if (unit !== emptySpace) {
          unit.coord = this.calcExpandedCoord(unit.coord);
        }
      }
    }

    return uni;
  }

  getGalaxies(): Galaxy[] {
    return this.universe
      .map(row => row.filter(col => col !== emptySpace)
      .map(col => col as Galaxy)) 
      .flat();
  }




  //based on the empty row/col info and the expansion factor, return an adjusted coordinate
  // ExpansionFactor represents how much empty row/col should expand.  
  //      An ExpansionFactor of 2 would mean that we would change the single empty row/col into 2 row/cols (or ADD 1 new empty/col)
  //      An ExpansionFactor of 10 would mean that we would change the single empty row/col into 10 row/cols (or ADD 9 new empty/col)
  //      An ExpansionFactor of X would mean that we would change the single empty row/col into X row/cols (or ADD X-1 new empty/col)
  // row: if the row is greater than the first empty.row, then ADD 1x(ExpansionFactor-1)
  //      if the row is greater than the second empty.row, then ADD 1x(ExpansionFactor-1)
  //      etc.
  // col: same as row 
  //
  // easier if you find the index of the empty.row/col element that is closest but less than the actual/row
  //        then: new row/col is equal to the old plus ((index+1) * expansionFactor) ... 
  //              assuming that if the row/col is less than any empty row/col, the index is -1;
  //
  // cache: to speed things up, we cache the row/col transformations 
  private _expandCache: { row: {[key: number]: number }, col: {[key: number]: number }} = { row: {}, col: {} };
  private calcExpandedCoord(coord: Coordinate) {
    let {row, col} = coord; 
    
    if (typeof this._expandCache.row[row] === 'number') {
      row = this._expandCache.row[row];
    } else {
      const rowIndex = this.findClosestIndex(this.empty.rows, row);
      row += (rowIndex+1) * (this.expansionFactor-1);
      this._expandCache.row[coord.row] = row;   //save in cache
    }

    if (typeof this._expandCache.col[col] === 'number') {
      col = this._expandCache.col[col];
    } else {
      const colIndex = this.findClosestIndex(this.empty.cols, col);
      col += (colIndex+1) * (this.expansionFactor-1);
      this._expandCache.col[coord.col] = col;   //save in cache
    }

    return new Coordinate(row, col);
  }

  // assumes that the numbers are ordered from small to large (ascending order)
  private findClosestIndex(numbers: number[], value: number) {
    //return [...numbers].reverse().findIndex(m => value > m);
    for (let index = numbers.length-1; index >= 0; index--) {
      if (value > numbers[index]) { return index; }
    }
    //else - not found
    return -1;
  }
}

export async function day11b(dataPath?: string) {
  const data = await readData(dataPath);

  const map = new Map();
  map.build(data);

  if (Verbose.isActive()) {
    map.getGalaxies().forEach(g => { verbose.add(`${g.name} ${g.coord.toString()}`).display(); });    
  }

  const total = map.shortestPaths().reduce((sum, curr) => {
    return sum+curr;
  }, 0);

  return total;
}

const answer = await day11b();
outputHeading(11, 'b');
outputAnswer(answer);
