import { Nullable } from '../../helpers/nullable.type.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { Coordinate } from '../day-10/coordinates.ts';
Verbose.setActive(true);
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
type GalaxyPair = [Galaxy, Galaxy];

const names = "123456789ABCDEFGHIJKLMNOPQRSTUVWαβγδεζηθικμνξοπρστυφχψω".split('');
const nameAt = (index: number) => { return names[index % names.length]; }
class Map {
  universe: Universe = [];

  build(data: string[]) {
    this.universe = this.parseData(data);
    if (Verbose.isActive()) {
      verbose.add(`universe is ${this.universe.length} rows by ${this.universe[0].length} columns`).display();
      // this.universe.forEach(row => {
      //   verbose.add(row.map(m => m === emptySpace ? m : m.name).join('')).display();
      // });
    }
    this.universe = this.expandUniverse(this.universe);
    if (Verbose.isActive()) {
      verbose.add(`after expansion, universe is ${this.universe.length} rows by ${this.universe[0].length} columns`).display();
      // this.universe.forEach(row => {
      //   verbose.add(row.map(m => m === emptySpace ? m : m.name).join('')).display();
      // });
    }
  }

  shortestPaths(): number[] {
    const pairs = this.getGalaxyPairs();
    verbose.add(`${pairs.length} pairs`).display();
    return pairs.map(([a,b]) => {
      const ret = Math.abs(a.coord.row - b.coord.row) + Math.abs(a.coord.col - b.coord.col);
      //verbose.add(`{${a.name},${b.name}} or {${a.coord.toString()}, ${b.coord.toString()}} => ${ret}`).display();
      return ret;
    })
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

    //keep track of which rows and columns are empty
    const empty = {
      rows: [] as number[],
      cols: [] as number[]
    }

    //check rows
    empty.rows = uni.map((m, row) => m.every(x => x === emptySpace) ? row : NaN).filter(m => !isNaN(m));

    //check columns
    for (let col = 0; col < uni[0].length; col++) {
      if (uni.every(m => m[col] === emptySpace)) {
        empty.cols.push(col);
      }
    }

    verbose.add(`Empty Rows: ${empty.rows.join(', ')}`).display();
    verbose.add(`Empty Columns: ${empty.cols.join(', ')}`).display();

    
    
    // expand by inserting empty space
    const columnCount = uni[0].length;
    for (let index = 0; index < empty.rows.length; index++) {
      const row = empty.rows[index];
      uni.splice(row+index, 0, (new Array(columnCount)).fill(emptySpace));
    }
    for (let index = 0; index < empty.cols.length; index++) {
      const col = empty.cols[index];
      uni.forEach(row => {
        row.splice(col+index, 0, emptySpace);
      });
    }
    
    // adjust the coordinates
    for (let row = 0; row < uni.length; row++) {
      for (let col = 0; col < uni[row].length; col++) {
        const unit = uni[row][col];
        if (unit !== emptySpace) {
          unit.coord = new Coordinate(row, col);
        }
      }
    }


    return uni;
  }

  private getGalaxies(): Galaxy[] {
    return this.universe
      .map(row => row.filter(col => col !== emptySpace)
      .map(col => col as Galaxy)) 
      .flat();
  }

  private getGalaxyPairs(): GalaxyPair[] {
    const pairs: GalaxyPair[] = [];
    const galaxies = this.getGalaxies();
    for (let aIndex = 0; aIndex < galaxies.length; aIndex++) {
      const a = galaxies[aIndex];
      for (let bIndex = aIndex+1; bIndex < galaxies.length; bIndex++) {
        const b = galaxies[bIndex];
        if (!this.findPair(pairs, a, b)) {
          pairs.push([a,b]);
        } else {
          throw new Error(`Error - found existing pair [${a.name},${b.name}]`);
        }
      }
    }
    return pairs;
  }

  private findPair(pairs: GalaxyPair[], a: Coordinate, b: Coordinate): Nullable<GalaxyPair>;
  private findPair(pairs: GalaxyPair[], a: Galaxy, b: Galaxy): Nullable<GalaxyPair>;
  private findPair(pairs: GalaxyPair[], a: Coordinate | Galaxy, b: Coordinate | Galaxy): Nullable<GalaxyPair> {
    const aCoord: Coordinate = "name" in a ? a.coord : a;
    const bCoord: Coordinate = "name" in b ? b.coord : b;
    return pairs.find(p => (p[0].coord.equals(aCoord) && p[1].coord.equals(bCoord)) || (p[0].coord.equals(bCoord) && p[1].coord.equals(aCoord)));
  }

}

export async function day11a(dataPath?: string) {
  const data = await readData(dataPath);

  const map = new Map();
  map.build(data);

  const total = map.shortestPaths().reduce((sum, curr) => {
    return sum+curr;
  }, 0);

  return total;
}

const answer = await day11a();
outputHeading(11, 'a');
outputAnswer(answer);
