import chalk from 'chalk';
import { readFile } from 'fs/promises';

export async function readData(path?: string) {
  const fileName = path || process.argv[2];
  const data = (await readFile(fileName)).toString()
                  .replace(/\r/g, '') //remove carriage returns if CRLF 
                  .split('\n');
  return data;
}



export function outputHeading(day: number, test: 'a' | 'b') {
  const text = `🎄    AOB #${day}-${test}    🎄`;
  console.log(chalk.white.bgRed(text));
  console.log(chalk.red(Array(text.length).fill('-').join('')));
}

export function outputAnswer(answer: unknown) {
  console.log(chalk.white.bgGreen('Your Answer:'), chalk.green(answer));
}