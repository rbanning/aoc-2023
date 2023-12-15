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

  const text = ` 🎄    AOB #${day}-${test}    🎄 `;
  console.log(chalk.red(Array(text.length).fill('-').join('')));
  console.log(chalk.white.bgRed(text));
  console.log(chalk.red(Array(text.length).fill('-').join('')));
}

export function outputAnswer(answer: unknown) {
  console.log(chalk.white.bgGreen('Your Answer:'), chalk.green(answer));
}



export class Verbose {
  private output: string[] = [];


  add(text: string) {
    if (this.output.length === 0) {
      this.output.push(text);
    } else {
      this.output[this.output.length - 1] += text;
    }
    return this;
  }

  newline() {
    this.output.push('');
    return this;
  }

  clear() {
    this.output = [];
    return this;
  }

  display(flush: boolean = true) {
    this.output.filter(Boolean)
      .forEach(line => this.verboseOutput(line));
    if (flush) {
      this.clear();
    }
    return this;
  }

  verboseOutput(text: string) {
    if (Verbose.isActive()) {
      console.log(chalk.whiteBright.bold('> '), chalk.gray(text));
    }
  }


  //#region >> STATIC <<

  private static _active = false;
  static setActive(active: boolean) {
    Verbose._active = active;
  }
  static isActive() { return Verbose._active; }


  static add(text: string) {
    const ret = new Verbose();
    return ret.add(text);
  }


  //#endregion
}