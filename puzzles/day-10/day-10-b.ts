import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { Loop } from './loop.ts';
import { PipeMap } from './pipe-map.ts';
import { Tile } from './pipe.ts';
Verbose.setActive(true);
const verbose = new Verbose();

export async function day10b(dataPath?: string) {
  const data = await readData(dataPath);
  const map = new PipeMap(data.map(row => row.split('').map(col => col as Tile)));

  const loop = Loop.build(map);
  const area = map.calculateArea(loop.start);
  const boundaryPoints = loop.start.path().length;
  const interiorPoints = area - (boundaryPoints/2) + 1;
  
  verbose.add(`Area: ${area}`).display();
  verbose.add(`Boundary Points: ${boundaryPoints}`).display();
  verbose.add(`Interior Points: ${interiorPoints}`).display();

  return interiorPoints;
}

const answer = await day10b();
outputHeading(10, 'b');
outputAnswer(answer);
