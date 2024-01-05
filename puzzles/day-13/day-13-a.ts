import { LCS } from '../../helpers/sequences.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

//NOTE: this is a practice to test the Longest Common Sequence problem

export async function day13a(dataPath?: string) {
  const data = await readData(dataPath);

  verbose.add('Longest Common Sequence...').display();
  data.map(line => {
    const [a, b] = line.split(' ').map(m => m.trim());
    const lcs = LCS.solveBasic<string>(a.split(''), b.split(''));
    if (Verbose.isActive()) {
      verbose.add(a).display().add(b).display().add(lcs.join('')).display().newline().display();
    }
    return lcs;
  });


  const total = '';
  return total;
}

const answer = await day13a();
outputHeading(13, 'a');
outputAnswer(answer);
