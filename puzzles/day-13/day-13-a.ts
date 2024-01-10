import { Nullable, isNullable } from '../../helpers/nullable.type.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { analyzePattern } from './approach-A.ts';
import { Grid, MirrorPattern, PatternChar, ReflectionIndices, ReflectionType } from './common.ts';
Verbose.setActive(true);
const verbose = new Verbose();

function parseData(data: string[]): Grid[] {
  const ret: Grid[] = [];
  let grid: Grid = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i].trim();
    if (element) {
      grid.push(element.split('') as PatternChar[])
    } else if (grid.length > 0) {
      ret.push(grid);
      grid = [];  //reset
    }
  }
  //be sure to get the last one!
  if (grid.length > 0) {
    ret.push(grid); 
  }

  return ret;
}

function patternValue(type: Nullable<ReflectionType>, indices: Nullable<ReflectionIndices>): number {
  const index = isNullable(indices) ? -1 : indices[0];
  if (type === 'vertical') { return (index+1); }
  if (type === 'horizontal') { return (index+1) * 100; }
  //else
  return 0;
}

export async function day13a(dataPath?: string) {
  const data = await readData(dataPath);

  const grids = parseData(data);

  const results: MirrorPattern[] = [];

  let total = 0;

  grids.forEach((grid, index) => {
    const { type, indices } = analyzePattern(grid) ?? {};
    results.push({grid, type, indices});
    total += patternValue(type, indices);
    verbose.add(`${index}: type: ${type ?? '??'}, indices: [${(indices ?? []).join(',')}], total: ${total}`).display();
  });



  return total;
}

const answer = await day13a();
outputHeading(13, 'a');
outputAnswer(answer);
