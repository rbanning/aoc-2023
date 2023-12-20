import { greatestCommonFactor, leastCommonMultiple, primeFactors } from '../../helpers.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();


type NetworkNode = [string, string];
type Network = {[key in string]: NetworkNode}
type Direction = 0 | 1;

type NodeStat = {
  start: string,
  current: string,
  steps: number,
  done?: boolean,
  factors?: number[]
};
const START = 'A';
const END = 'Z';


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

function move(stats: NodeStat[], network: Network, direction: Direction): NodeStat[] {
  stats.forEach(stat => {
    if (!stat.done) {
      stat.current = network[stat.current][direction];
      stat.steps += 1;
      stat.done = isEnd(stat.current);
    }
  })
  return stats;
}

function isStart(node: string) { return node.endsWith(START); }
function isEnd(node: string) { return node.endsWith(END); }

export async function day8b(dataPath?: string) {
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
  let stats: NodeStat[] = Object.keys(network)
    .filter(isStart)
    .map(start => ({start, current: start, steps: 0 }));

  const REASONABLE_COUNT = 100000000;
  console.time("work");
  console.timeLog("work", "starting our journey...");
  while (!stats.every(s => s.done) && steps < REASONABLE_COUNT) {
    move(stats, network, directions[directionIndex]);
    directionIndex = (directionIndex + 1) % directions.length;
    steps++;
  }
  console.timeEnd("work");

  if (Verbose.isActive()) {
    stats.forEach(s => {
      s.factors = primeFactors(s.steps);
      verbose.add(`'${s.start} to ${s.current} in ${s.steps} steps with factors: ${s.factors.join(' x ')}`).display();
    });
  }

  const gcf = greatestCommonFactor(...stats.map(s => s.steps));
  verbose.add(`GCF: ${gcf}`).display();
  const lcm = leastCommonMultiple(...stats.map(s => s.steps));
  verbose.add(`LCM: ${lcm}`).display();

  return lcm;
}

const answer = await day8b();
outputHeading(8, 'b');
outputAnswer(answer);
