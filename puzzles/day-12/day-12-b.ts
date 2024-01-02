import { isNullable } from '../../helpers/nullable.type.ts';
import { Store } from '../../helpers/store.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

const foldFactor: number = 5;
const store = new Store<Springs[]>(
  (value: Springs) => { return value.join(''); },
  (value: number[]) => { return value.join(','); },
  (value: number) => { return `${value}`; }
);

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
  if (store.hasKey(springs, targetLengths, index)) {
    verbose.add(`Store paid off!  key = ${store.key(springs, targetLengths, index)}`).display();
    return store.get(springs, targetLengths, index);
  }


  if (index === springs.length) {
    //stop --- nothing to check
    store.add(recordIsValid(springs, targetLengths) ? [springs] : [], springs, targetLengths, index);
    return store.get(springs, targetLengths, index);
  }

  const char = springs[index];
  switch (char) {
    case operationalSpring:
      case damagedSpring:
      //otherwise just ignore the char and continue
      store.add(calcVariants(springs, targetLengths, index+1), springs, targetLengths, index);
      break;

    case unknownSpring:
      //try replacing with operational and damaged
      const a = [...springs]; a[index] = operationalSpring;
      const b = [...springs]; b[index] = damagedSpring;
      store.add([
        ...calcVariants(a, targetLengths, index+1),
        ...calcVariants(b, targetLengths, index+1),
      ], springs, targetLengths, index);
      break;

    default: 
      throw new Error(`Found unknown spring char '${char}'`);
  }

  return store.get(springs, targetLengths, index);

}


export async function day12b(dataPath?: string) {
  const data = await readData(dataPath);

  const records: RecordRow[] = data.map(line => parseRow(line));
  records.forEach((row, index) => {
    verbose.add(`Row: ${index}: ${row.springs.join('')}  ${row.recordedGroupings.join(', ')}`).display();
  })
  for (let index = 0; index < 2; index++) {    
    const record = records[index];
    verbose.add(`Variants: Row ${index}...`).display();
    record.variants = calcVariants(records[index].springs, records[index].recordedGroupings, 0);
    if (Verbose.isActive()) {
      verbose.add(` Found ${record.variants.length} for row #${index}`).display();
      // record.variants.forEach((v, index) => {
      //   verbose.add(`   ${index}) '${v.join('')}'`).display();
      // });
    }
  }

  verbose.add(`Store has ${store.length} keys`).display();

  const total = records.reduce((sum, record) => {
    return sum + (isNullable(record.variants) ? 0 : record.variants.length);
  }, 0);
  return total;
}

const answer = await day12b();
outputHeading(12, 'b');
outputAnswer(answer);
