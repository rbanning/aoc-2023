import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { calcVariants } from './approach-B.ts';
import { RecordRow, Springs, springChars, SpringChar } from './common.ts';
Verbose.setActive(true);
const verbose = new Verbose();



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
  })
  return  {
    springs,
    targetLengths: recordedGroupings
  }
}

export async function day12a(dataPath?: string) {
  const data = await readData(dataPath);

  const records: RecordRow[] = data.map(line => parseRow(line));
  if (Verbose.isActive()) {
    records.forEach((row, index) => {
      verbose.add(`Row: ${index}: ${row.springs.join('')}  ${row.targetLengths.join(', ')}`).display();
    })
  }

  for (let index = 0; index < records.length; index++) {    
    const record = records[index];
    record.variants = calcVariants(records[index].springs, records[index].targetLengths, 0);
    if (Verbose.isActive()) {
      verbose.add(`Found ${record.variants.length} for row #${index}`).display();
      record.variants.forEach((v, index) => {
        verbose.add(`   ${index}) '${v.join('')}'`).display();
      });
    }
  }

  const total = records.reduce((sum, record) => {
    return sum + record.variants.length;
  }, 0);
  return total;
}

const answer = await day12a();
outputHeading(12, 'a');
outputAnswer(answer);
