import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

type RaceParam = { time: number, record: number, count?: number };

function lineToNumbers(line: string): number[] {
  const parts = line.split(':');
  if (parts.length !== 2) { throw new Error(`Invalid data line - expected two parts but found ${parts.length} - ${line}`); }
  return parts[1].trim()
    .split(' ')
    .filter(Boolean)
    .map(m => parseInt(m)); 
}

function parseInput(lines: string[]): RaceParam[] {
  if (!Array.isArray(lines)) { throw new Error("Invalid data input (lines) - is not an array"); }
  if (lines.length !== 2) { throw new Error(`Invalid data input (lines) - expected two lines but found ${lines.length}`); }
  const times = lineToNumbers(lines[0]);
  const distances = lineToNumbers(lines[1]);
  if (times.length !== distances.length) { throw new Error(`Invalid data input (lines) - expected same number of times and distances but found ${times.length} times and ${distances.length} distances`); }

  return times.map((time, index) => {
    return {
      time,
      record: distances[index]
    } as RaceParam;
  });
}

function distance(time_total: number, time_button: number): number {
  return (time_total - time_button) * time_button;
}

function calcAllDistances(time_total: number): number[] {
  const ret: number[] = [];
  for (let time = 0; time <= time_total; time++) {
    ret.push(distance(time_total, time));    
  }
  return ret;
}

export async function day6a(dataPath?: string) {
  const data = await readData(dataPath);

  const params: RaceParam[] = parseInput(data);
  
  params.forEach(param => {
    const possible = calcAllDistances(param.time);
    verbose.add(`Possible distances for ${15}...`).display();
    param.count = 0;
    possible.forEach((d, t) => {
      const flag = d > param.record;
      if (flag) { param.count += 1; }
      verbose.add(`  d(${t}) = ${d} ${flag ? '*' : ''}`).display();
    })
    verbose.add(`Total possible ways to win: ${param.count}`).display();
  });

  return params.reduce((product, param) => {
    return product * param.count;
  }, 1);
}

const answer = await day6a();
outputHeading(6, 'a');
outputAnswer(answer);
