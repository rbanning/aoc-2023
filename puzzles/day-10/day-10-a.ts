import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
import { Loop } from './loop.ts';
import { PipeMap } from './pipe-map.ts';
import { Tile } from './pipe.ts';
Verbose.setActive(true);
const verbose = new Verbose();

export async function day10a(dataPath?: string) {
  const data = await readData(dataPath);
  const map = new PipeMap(data.map(row => row.split('').map(col => col as Tile)));

  const loop = Loop.build(map);
  let total = loop.stepsToFurthestPoint();
  return total;
}

const answer = await day10a();
outputHeading(10, 'a');
outputAnswer(answer);
