import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();


type NetworkNode = [string, string];
type Network = {[key in string]: NetworkNode}
type Direction = 0 | 1;

const START = 'AAA';
const END = 'ZZZ';

function toDirection(char: string): Direction {
  //validate 
  if (char !== 'L' && char !== 'R') { throw new Error(`Invalid direction character "${char}" - expected L or R`); }
  return char === 'L' ? 0 : 1;
}


function getNodePair(input: string): NetworkNode {
  const pair = input.replace(/[\(\)]/g, '').split(',').map(m => m.trim());
  if (pair.length !== 2) { throw new Error(`Error parsing node pair - expected two parts but found ${pair.length} - line: ${input}`); }
  return pair as NetworkNode;
}

function parseNetwork(lines: string[]): Network {
  const network: Network = {};

  lines.forEach(line => {
    const parts = line.split('=').map(m => m.trim());
    if (parts.length !== 2) { throw new Error(`Error parsing network node - expected two parts but found ${parts.length} - line: ${line}`); }
    network[parts[0]] = getNodePair(parts[1]);
  });

  return network;
}

function move(node: NetworkNode, direction: Direction): string {
  return node[direction];
}

export async function day8a(dataPath?: string) {
  const data = await readData(dataPath);

  //first line are the directions
  const directions: Direction[] = data.shift().split('').map(toDirection);
  verbose.add(`directions: ${directions.length}`).display();

  //skip to network
  while (data.length && data[0].length === 0) { data.shift(); }

  const network = parseNetwork(data);
  verbose.add(`network: ${Object.keys(network).length}`).display();

  //traverse
  let steps = 0;
  let directionIndex = 0;
  let node: string = START;

  const REASONABLE_COUNT = 100000000;
  console.time("work");
  console.timeLog("work", "starting our journey...");
  while (node !== END && steps < REASONABLE_COUNT) {
    node = move(network[node], directions[directionIndex]);
    directionIndex = (directionIndex + 1) % directions.length;
    steps++;
  }
  console.timeEnd("work");

  return steps;
}

const answer = await day8a();
outputHeading(8, 'a');
outputAnswer(answer);
