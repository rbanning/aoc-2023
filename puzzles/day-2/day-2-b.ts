import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';

const cubeColors = ['red', 'green', 'blue'] as const;
type CubeColor = typeof cubeColors[number];

type SetOfCubes = {[key in CubeColor]: number}
type CubeTuple = [CubeColor, number];

function emptySetOfCubes() {
  return cubeColors.reduce((ret, color) => {
    ret[color] = 0;
    return ret;
  }, {}) as SetOfCubes;
} 

function displaySetOfCubes(cubes: SetOfCubes) {
  return '{ ' + cubeColors.map(color => {
    return `${color}=${cubes[color]}`;
  }).join(', ')
  + ' }';
}

type Game = {
  id: number,
  cubes: SetOfCubes[],
  possible?: boolean,
  minPossible?: SetOfCubes,
  power?: number
}

function extractGame(line: string): Game {
  if (!line) { throw new Error('Error extractingGame - empty line'); }

  const parts = line.split(':').map(m => m.trim());
  if (parts.length !== 2) { throw new Error(`Error extractingGame - invalid input - too many colons - input: ${line}`); }

  const game: Game = {
    id: parseGameId(parts[0]),
    cubes: parseRounds(parts[1])
  };

  if (isNaN(game.id)) { throw new Error(`Error extractingGame - invalid game id (${parts[0]}) - input: ${line}`); }

  verbose.add(`> ${line}`)
  verbose.newline();
  verbose.add(`  (${game.id}) - ${game.cubes.map(m => displaySetOfCubes(m)).join(' ')}`);
  verbose.display();

  return game;
}

function parseGameId(input: string): number {
  if (!input) { throw new Error('Error parsing game id - empty input'); }

  const parts = input.split(' ');
  let id: number = NaN;
  for (let index = 0; index < parts.length && isNaN(id); index++) {
    id = parseInt(parts[index]);    
  }

  return id;
}

function parseRounds(input: string): SetOfCubes[] {
  if (!input) { throw new Error("Error parsing rounds - empty input"); }

  const result = input.split(';')
    .map(m => extractSetOfCubes(m.trim()));

  return result;
}

function extractSetOfCubes(input: string): SetOfCubes {
  if (!input) { throw new Error("Error extracting set of cubes - empty input"); }

  const result = input.split(',')
    .map(m => m.trim())
    .reduce((ret, text) => {
      const tuple = parseCubeCount(text);
      ret[tuple[0]] = tuple[1];
      return ret;
    }, emptySetOfCubes())
  
  return result;
}

function parseCubeCount(input: string): CubeTuple {
  if (!input) { throw new Error("Error parsing cube count - empty input"); }

  const parts = input.split(' ').map(m => m.trim());
  if (parts.length !== 2) { throw new Error(`Error parsing cube count - invalid input - expected two parts - input: ${input}`); }

  const count = parseInt(parts[0]);
  if (isNaN(count)) { throw new Error(`Error parsing cube count - invalid count (${parts[0]}) - input: ${input}`); }

  const color = cubeColors.find(m => m === parts[1]);
  if (!color) { throw new Error(`Error parsing cube count - invalid color (${parts[1]}) - input: ${input}`); }

  //else
  return [color, count];
}

function roundIsPossible(round: SetOfCubes, bag: SetOfCubes): boolean {
  return cubeColors.every(color => {
    return round[color] <= bag[color];
  });
}


function calculateMinPossibleCubeSet(round: SetOfCubes[]): SetOfCubes {
  return round.reduce((ret, curr) => {
    cubeColors.forEach(color => {
      ret[color] = Math.max(ret[color], curr[color]);
    });
    return ret;
  }, emptySetOfCubes());
}

function calculatePower(cubeSet: SetOfCubes): number {
  return cubeColors.reduce((ret, color) => {
    return ret * cubeSet[color];
  }, 1)
}

function updateGame(game: Game, bag: SetOfCubes): Game {
  const ret = {
    ...game,
    possible: game.cubes.every(round => roundIsPossible(round, bag)),
    minPossible: calculateMinPossibleCubeSet(game.cubes)
  } as Game;

  ret.power = calculatePower(ret.minPossible);
  return ret;
}

const verbose = new Verbose();

export async function day2b(dataPath?: string) {
  const knownBag: SetOfCubes = {
    red: 12,
    green: 13,
    blue: 14
  };

  const data = (await readData(dataPath)).filter(Boolean);
  const games = data.map(m => extractGame(m))
          .map(game => updateGame(game, knownBag));

  games.forEach(game => {
    verbose.add(`Game ${game.id}: minPossible = ${displaySetOfCubes(game.minPossible)}`)
      .add(` ~~ POWER: ${game.power}`)
      .display();
  });

  console.log('DEBUG: zero-powers', games.filter(m => m.power <= 0));

  const result = games
    .reduce((sum, game) => {
      return sum + game.power;
    }, 0);
  
  return result;
}

Verbose.setActive(false);
const answer = await day2b();
outputHeading(2, 'b');
outputAnswer(answer);

