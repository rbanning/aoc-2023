import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';


class PartNumber {
  row: number;
  cols: number[] = [];
  isInCoord(row: number, col: number): boolean {
    return this.row === row && this.cols.includes(col);
  }

  constructor(row: number, col: number, digit: unknown) {
    this.row = row;
    this.addDigit(col, digit);
  }

  private _value: number = 0;
  get value() { return this._value; }

  addDigit(col: number, digit: unknown) {
    if (this.cols.includes(col)) { throw new Error(`Error addDigit(${col}, ${digit}) - Already added digit in row: ${this.row}, col: ${col}`); }
    if (typeof(digit) === 'number') {
      if (!Number.isInteger(digit)) { throw new Error("Error addDigit(${col}, ${digit}) - Digit must be an integer"); }
      if (digit < 0 || digit > 10) { throw new Error("Error addDigit(${col}, ${digit}) - Digit must be between 0 and 9"); }
      //ok
      this.cols.push(col);
      this._value = (this._value * 10) + digit;
    } else {
      throw Error("Error addDigit(${col}, ${digit}) - Digit must be a number");
    }

    return this;
  }  
}


type Coordinate = { row: number, col: number }
class Gear {
  coord: Coordinate; 

  constructor(row: number, col: number) {
    this.coord = {row, col};
  }

  private _partNumbers: PartNumber[] = [];
  get partNumbers() { return [...this._partNumbers]; }    //note shallow copy
  addPartNumber(partNumber: PartNumber) { this._partNumbers.push(partNumber); }

  findPartNumber(row: number, col: number): PartNumber | null | undefined {
    return this._partNumbers.find(p => p.isInCoord(row, col));
  }

  isValid() {
    //adjacent to exactly two part numbers!
    return this._partNumbers.length === 2;
  }

  ratio(): number {
    if (this.isValid()) {
      return this._partNumbers.reduce((product, part) => {
        return product * part.value;
      }, 1);
    }
    //else
    return 0;
  }

  static Create(row: number, col: number, schematic: Schematic, partNumbers: PartNumber[]): Gear {
    const gear = new Gear(row, col);

    //find all part numbers adjacent to the gear
    const checks = [
      [row-1,col-1], [row-1,col], [row-1,col+1],
      [row,col-1], [row,col+1],
      [row+1,col-1], [row+1,col], [row+1,col+1]
    ];

    for (let index = 0; index < checks.length; index++) {
      const [r,c] = checks[index];
      //check bounds
      if (r >= 0 && r < schematic.length && c >= 0 && c < schematic[r].length) {
        const cell = schematic[r][c];
        if (typeof(cell) === 'number') {
          let part = gear.findPartNumber(r,c);  
          //if (part) { /*nothing to do */ } 
          if (!part) {
            //part has not been added
            part = partNumbers.find(p => p.isInCoord(r,c));
            if (part) {
              gear.addPartNumber(part);
            } else {
              //oops this should not happen?
              throw new Error(`Error creating gear (${row}, ${col}) - checked (${r}, ${c}) and found digit not connected to a part number`);
            }
          }
        }
      }
    }  

    return gear;
  }
}


const GEAR_SYMBOLS = ['*'] as const; 
type Gear_Symbol = typeof GEAR_SYMBOLS[number];
const DIGITS = [0,1,2,3,4,5,6,7,8,9] as const;
type Digit = typeof DIGITS[number];
const PLACEHOLDERS = ['.'] as const;
type Placeholder = typeof PLACEHOLDERS[number];

type SchematicCellType = 'digit' | 'placeholder' | 'symbol';
const schematicCellTypes: {[key in SchematicCellType]: string[] } = {
  symbol: GEAR_SYMBOLS.map(m => `${m}`),
  digit: DIGITS.map(m => `${m}`),
  placeholder: PLACEHOLDERS.map(m => `${m}`)
};

type SchematicElement = Digit | Boolean; //true = gear, false means Placeholder
type SchematicRow = SchematicElement[];
type Schematic = SchematicRow[];

function parseSchematicChar(char: string): SchematicElement {
  if (schematicCellTypes.digit.includes(char)) { return parseInt(char) as Digit; }
  else if (schematicCellTypes.symbol.includes(char)) { return true; }
  //else if (schematicCellTypes.placeholder.includes(char)) { return false; }

  //else (treat as a placeholder)
  return false;
}

function parseSchematicLine(input: string): SchematicRow {
  return input.split('')
    .map(parseSchematicChar);
}

function parseSchematic(input: string[]): Schematic {
  const result = input.map(parseSchematicLine);
  //validate
  if (result.length > 0) {
    if (!result.every(row => row.length === result[0].length)) {
      throw new Error('Error parsing schematic - not all of the rows are of the same length');
    }
  }
  return result;
}


function hasSymbolAdjacent(row: number, col: number, schematic: Schematic): boolean {
  const checks = [
    [row-1,col-1], [row-1,col], [row-1,col+1],
    [row,col-1], [row,col+1],
    [row+1,col-1], [row+1,col], [row+1,col+1]
  ];
  let adjacent: boolean = false;
  for (let index = 0; index < checks.length && !adjacent; index++) {
    const [r,c] = checks[index];
    //check bounds
    if (r >= 0 && r < schematic.length && c >= 0 && c < schematic[r].length) {
      const cell = schematic[r][c];
      adjacent = cell === true;  
    }
  }

  return adjacent;
}

function buildPartNumbers(schematic: Schematic): PartNumber[] {
  var ret: PartNumber[] = [];
  schematic.forEach((row, rowIndex) => {
    let partNumber: PartNumber | null = null;
    row.forEach((col, colIndex) => {
      if (typeof(col) === 'number') {
        if (!partNumber) { 
          partNumber = new PartNumber(rowIndex, colIndex, col); 
          ret.push(partNumber);
        }
        else { 
          partNumber.addDigit(colIndex, col); 
        }
      } else {
        //reset
        partNumber = null;
      }
    });
  });

  return ret;
}


const verbose = new Verbose();

export async function day3b(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);
  const schematic = parseSchematic(data);
  const partNumbers = buildPartNumbers(schematic);

  const gears: Gear[] = [];
  schematic.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === true) {
        gears.push(Gear.Create(rowIndex, colIndex, schematic, partNumbers));
      }
    })
  })

  console.log(gears);

  return gears.reduce((sum, curr) => {  
    if (curr.isValid()) {
      sum += curr.ratio();
    }  
    return sum;
  }, 0);
}

Verbose.setActive(false);
const answer = await day3b();
outputHeading(3, 'b');
outputAnswer(answer);