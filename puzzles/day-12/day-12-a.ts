import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();

const damagedSpring = '#';
const operationalSpring = '.';
const unknownSpring = '?';
const springChars = [damagedSpring, operationalSpring, unknownSpring] as const;
type SpringChar = typeof springChars[number];
type Springs = SpringChar[];


type RecordRow = {
  springs: Springs,
  recordedGroupings: number[],
  variants?: Springs[]
}


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
    recordedGroupings
  }
}

function springsToGroups(springs: Springs): Springs[] {
  let group: Springs = [];
  return springs.reduce((result, curr, index) => {
    //add the group to the result if we find an operational spring 
    if (curr === operationalSpring) {
      if (group.length > 0) { result.push(group); }
      group = [];
    } else {
      group.push(curr);
    }
    //add the group to the result if we are at the end
    if (index === (springs.length-1) && group.length > 0) { result.push(group); }
    return result;
  }, [] as Springs[]);
}

function groupToString(group: Springs[]): string {
  return group.map((springs, index) => `${index}: '${springs.join('')}'`).join(', ');
}

function recordIsValid(springs: Springs, targetLengths: number[]): boolean {
  const groups = springsToGroups(springs);
  let result = false;
  if (groups.length === targetLengths.length) {
    result = groups.every((group, index) => {
      return group.length === targetLengths[index]
      && group.every(ch => ch === damagedSpring);
    })
  } 
  
  // verbose.add(`     recordIsValid('${springs.join('')}', [${targetLengths}]) => [${groupToString(groups)}] => ${result}`).display();
  
  return result; 
}

function calcVariants(springs: Springs, targetLengths: number[], index: number): Springs[] {
  
  // verbose.add(`   calcVariants(springs: '${springs.join('')}', targets: [${targetLengths}], index: ${index})`).display();

  if (index === springs.length) {
    //stop --- nothing to check
    return recordIsValid(springs, targetLengths) ? [springs] : [];
  }

  const char = springs[index];
  switch (char) {
    case operationalSpring:
      case damagedSpring:
      //otherwise just ignore the char and continue
      return calcVariants(springs, targetLengths, index+1);

    case unknownSpring:
      //try replacing with operational and damaged
      const a = [...springs]; a[index] = operationalSpring;
      const b = [...springs]; b[index] = damagedSpring;
      return [
        ...calcVariants(a, targetLengths, index+1),
        ...calcVariants(b, targetLengths, index+1),
      ];
    
    default: 
      throw new Error(`Found unknown spring char '${char}'`);
  }
}


export async function day12a(dataPath?: string) {
  const data = await readData(dataPath);

  const records: RecordRow[] = data.map(line => parseRow(line));
  records.forEach((row, index) => {
    verbose.add(`Row: ${index}: ${row.springs.join('')}  ${row.recordedGroupings.join(', ')}`).display();
  })
  for (let index = 0; index < records.length; index++) {    
    const record = records[index];
    record.variants = calcVariants(records[index].springs, records[index].recordedGroupings, 0);
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
