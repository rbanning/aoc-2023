import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

type RaceParam = { time: number, record: number, count?: number };

function lineToNumber(line: string): number {
  const parts = line.split(':');
  if (parts.length !== 2) { throw new Error(`Invalid data line - expected two parts but found ${parts.length} - ${line}`); }
  return parts[1].trim()
    .split(' ')
    .filter(Boolean)
    .reduce((ret, curr) => {
      curr = curr.trim(); //just in case :-)
      const parts = curr.trim().split('');
      while(parts.length > 0) {
        const digit = parts.shift();
        ret = ret*10 + parseInt(digit);
      }
      return ret;
    }, 0);
}

function parseInput(lines: string[]): RaceParam {
  if (!Array.isArray(lines)) { throw new Error("Invalid data input (lines) - is not an array"); }
  if (lines.length !== 2) { throw new Error(`Invalid data input (lines) - expected two lines but found ${lines.length}`); }
  const time = lineToNumber(lines[0]);
  const record = lineToNumber(lines[1]);
  return {
    time, record
  };
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

export async function day6b(dataPath?: string) {
  const data = await readData(dataPath);

  const param: RaceParam = parseInput(data);
  const possible = calcAllDistances(param.time);
  verbose.add(`Possible distances for ${param.time}ms with record of ${param.record}mm...`).display();
  param.count = 0;
  possible.forEach((d, t) => {
    const flag = d > param.record;
    if (flag) { param.count += 1; }
  })
  verbose.add(`Total possible ways to win: ${param.count}`).display();

  return param.count;
}

const answer = await day6b();
outputHeading(6, 'b');
outputAnswer(answer);
