import { readData, outputHeading, outputAnswer } from '../../shared.ts';
import chalk from 'chalk';

export async function day1a(dataPath?: string) {
  const data = await readData(dataPath);
  return 0;
}

const answer = await day1a();
outputHeading(1, 'a');
outputAnswer(answer);

