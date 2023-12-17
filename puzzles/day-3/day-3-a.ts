import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';

const SYMBOLS = ['~','`','!','@','#','$','%','^','&','*','_','-','+','=','\\','|','?','/'] as const;
type Symbol = typeof SYMBOLS;
const DIGITS = [0,1,2,3,4,5,6,7,8,9] as const;
type Digit = typeof DIGITS[number];
const PLACEHOLDERS = ['.'] as const;
type Placeholder = typeof PLACEHOLDERS[number];

type SchematicCellType = 'digit' | 'placeholder' | 'symbol';
const schematicCellTypes: {[key in SchematicCellType]: string[] } = {
  symbol: SYMBOLS.map(m => `${m}`),
  digit: DIGITS.map(m => `${m}`),
  placeholder: PLACEHOLDERS.map(m => `${m}`)
};

type SchematicElement = Digit | Boolean; //true means Symbol, false means Placeholder
type SchematicRow = SchematicElement[];
type Schematic = SchematicRow[];

function parseSchematicChar(char: string): SchematicElement {
  if (schematicCellTypes.digit.includes(char)) { return parseInt(char) as Digit; }
  else if (schematicCellTypes.symbol.includes(char)) { return true; }
  else if (schematicCellTypes.placeholder.includes(char)) { return false; }
  //else (not found)
  throw new Error(`Error parsing schematic char ('${char}') - does not match any known type`);
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

function extractPartNumbers(schematic: Schematic): number[] {
  var ret: number[] = [];
  schematic.forEach((row, rowIndex) => {
    let partNumber: number = 0;
    let adjacent: boolean = false;
    row.forEach((col, colIndex) => {
      if (typeof(col) === 'number') {
        partNumber = (partNumber*10) + col;
        adjacent = adjacent || hasSymbolAdjacent(rowIndex, colIndex, schematic);
      } else {
        if (adjacent) {
          ret.push(partNumber); //save
        }
        //reset
        partNumber = 0;
        adjacent = false;
      }
    });
    //oops.. missed this first time through!
    if(adjacent) {
      ret.push(partNumber);
    }
  });

  return ret;
}

function displaySchematicRow(row: SchematicRow): string {
  return row.map(char => {
    return typeof(char) === 'number' ? `${char}`
      : (char === true ? '*' : '.');
  }).join('');
}





const verbose = new Verbose();

export async function day3a(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);
  const schematic = parseSchematic(data);
  const partNumbers = extractPartNumbers(schematic);

  return partNumbers.reduce((sum, curr) => {
    return sum + curr;
  }, 0);
}

Verbose.setActive(false);
const answer = await day3a();
outputHeading(3, 'a');
outputAnswer(answer);