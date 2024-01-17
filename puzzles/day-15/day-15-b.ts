import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { generateBoxes, valueOfLensesInBox } from './approach-B.ts';

Verbose.setActive(false);
const verbose = new Verbose();

function parseData(data: string[]): string[] {
  return data[0].split(',');
}

export async function day15b(dataPath?: string) {
  const data = await readData(dataPath);
  const steps = parseData(data);
  
  const boxes = generateBoxes(steps);

  if (Verbose.isActive()) {
    boxes.forEach((box, index) => {
      if (box.length > 0) {
        verbose.add(`Box ${index} (${valueOfLensesInBox(box)}) = ${box.map(lens => `[${lens.label} ${lens.focalLength}]`).join(' ')}`).display();
      }
    });
  }

  //console.log(boxes);

  return boxes.reduce((sum, box) => {
    sum += valueOfLensesInBox(box);
    return sum;
  }, 0);
}

const answer = await day15b();
outputHeading(15, 'b');
outputAnswer(answer);
