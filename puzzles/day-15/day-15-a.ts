import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { generateHash } from './approach-A.ts';

Verbose.setActive(true);
const verbose = new Verbose();

function parseData(data: string[]): string[] {
  return data[0].split(',');
}

export async function day15a(dataPath?: string) {
  const data = await readData(dataPath);
  const steps = parseData(data);
  
  return steps.reduce((sum, input) => {
    sum += generateHash(input);
    return sum;
  }, 0);
}

const answer = await day15a();
outputHeading(15, 'a');
outputAnswer(answer);
