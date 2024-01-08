import { isNullable } from '../../helpers/nullable.type.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { calcVariants } from './approach-B.ts';
import { RecordRow, SpringChar, Springs, damagedSpring, operationalSpring, springChars, unknownSpring } from './common.ts';
Verbose.setActive(true);
const verbose = new Verbose();

const foldFactor = 1;

function parseRow(line: string): RecordRow {
  const parts = line.split(' ').map(m => m.trim());
  if (parts.length !== 2) { throw new Error(`Error parsing row: expected there to be two parts but found ${parts.length}: ${parts.join('|')}`); }

  const springs: Springs = parts[0].split('').map(ch => {
    if (springChars.includes(ch as SpringChar)) { return ch; }
    //else
    throw new Error(`Error parsing row: found invalid spring character '${ch}' in '${parts[0]}'`);
  }) as Springs;

  const recordedGroupings = parts[1].split(',').map(m => {
    const int = parseInt(m);
    if (isNaN(int)) { throw new Error(`Error parsing row: found invalid integer '${m}' in the recorded groupings '${parts[1]}'`); }
    return int;
  });


  return  {
    springs: unfold(springs, foldFactor, '?'),
    recordedGroupings: unfold(recordedGroupings, foldFactor)
  }
}

function unfold<T extends SpringChar | number>(arr: T[], factor: number, delim?: T): T[] {
  let ret: T[] = [];
  for (let i = 0; i < factor; i++) {
    if (i > 0 && typeof(delim) !== 'undefined') {
      ret.push(delim);
    }
    ret = [
      ...ret,
      ...arr
    ]
  }
  return ret;
}


export async function day12b(dataPath?: string) {
  const data = await readData(dataPath);

  const records: RecordRow[] = data.map(line => parseRow(line));
  for (let index = 0; index < records.length; index++) {    
    const record = records[index];
    verbose.add(`Variants: Row ${index}...`).display();
    record.variants = calcVariants(records[index].springs, records[index].recordedGroupings, 0);
    if (Verbose.isActive()) {
      verbose.add(`Row: ${index}: (${record.variants.length} variants) ${record.springs.join('')}  ${record.recordedGroupings.join(', ')}`).display();
      // record.variants.forEach((v, index) => {
      //   verbose.add(`   ${index}) '${v.join('')}'`).display();
      // });
    }
  }

  const total = records.reduce((sum, record) => {
    return sum + (isNullable(record.variants) ? 0 : record.variants.length);
  }, 0);
  return total;
}

const answer = await day12b();
outputHeading(12, 'b');
outputAnswer(answer);
