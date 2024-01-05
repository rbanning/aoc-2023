import { LIS } from '../../helpers/sequences.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

//NOTE: this is a practice to test the Longest Increasing Subsequence problem

export async function day13b(dataPath?: string) {
  const data = await readData(dataPath);

  verbose.newline().display().add('Longest Increasing Subsequence...').display();
  data.map(line => {
    const a = line.trim().split('');
    verbose.add(line).display();
    let lisMax: string[] = [];
    for (let i = 0; i < a.length; i++) {
      const element = [...a].slice(i);
      const lis = LIS.solveBasic<string>(element);
      if (lis.length > lisMax.length) { lisMax = lis; }
      verbose.add(`   ${lis.join('')}`).display();
    }
    verbose.add(`  * ${lisMax.join('')}`).display().newline().display();
    return lisMax;
  });

  const total = '';
  return total;
}

const answer = await day13b();
outputHeading(13, 'b');
outputAnswer(answer);
