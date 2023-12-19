import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(true);
const verbose = new Verbose();

const categoryList = ['seed-to-soil', 'soil-to-fertilizer', 'fertilizer-to-water', 'water-to-light', 'light-to-temperature', 'temperature-to-humidity', 'humidity-to-location'] as const;
type CategoryType = typeof categoryList[number];

type ConversionParams = {
  SourceStart: number,
  SourceRange: number,
  OutcomeStart: number,
};

type ConversionFn = (source: number) => number;
type ConversionMap = {[key in CategoryType]: ConversionFn}
const baseConversionMap = categoryList.reduce((ret, key) => {
  ret[key] = (source: number) => source;
  return ret;
}, {}) as ConversionMap;

type SeedParams = { start: number, count: number };

function parseDataInput(lines: string[]): { seeds: SeedParams[], conversionMap: ConversionMap | null } {
  //first line are seeds
  const seeds = parseSeeds(lines.shift());
  const map = {...baseConversionMap};

  verbose.add(`PARSING LINES ${lines.length}`).display();
  
  const updateMap = (category: CategoryType, params: ConversionParams[]) => {
    // verbose.add(`updateMap - ${category}...`).display();
    // params.forEach(p => verbose.add(`  [${p.OutcomeStart}, ${p.SourceStart}, ${p.SourceRange}]`).display());
    map[category] = buildConversionFn(params);
  }

  let category: CategoryType | null = null;
  let params: ConversionParams[] = [];
  lines.forEach((line, index) => {
    line = line.trim();
    if (line) {
      if (line.includes(':')) {
        //should be start of new category so save existing
        if (category) { updateMap(category, params); }
        const _category = line.split(':')[0].replace('map', '').trim();
        category = categoryList.find(m => (m as string) === _category);
        if (!category) { throw new Error(`Error parsing category - "${_category}" - "${line}"`); }
        params = [];
      } 
      else 
      {
        //add to params
        params.push(parseConversionParams(line));
      }
    }
  })
  if (category) {
    updateMap(category, params);
  }

  return {
    seeds,
    conversionMap: map
  }
}

function parseSeeds(input: string): SeedParams[] {
  const TARGET = 'seeds:';
  if (!input.startsWith(TARGET)) { throw new Error(`Error parsing seeds - must start with "${TARGET}" = ${input}`); }
  const data = input
    .substring(TARGET.length)
    .split(' ')
    .filter(Boolean)
    .map(m => parseInt(m.trim()));

  if (data.some(m => isNaN(m))) { 
    if (Verbose.isActive()) {
      verbose.add(`> ERROR (parseSeeds) - ${input}`).display();
      const source = input
      .substring(TARGET.length)
      .split(' ');
      data.forEach((m, index) => {
        if (isNaN(m)) {
          verbose.add(` ... [${index}] "${source[index]}"`).display();
        }
      });
    }
    throw new Error(`Error parsing seeds - invalid value(s) found: ${input}`); 
  }

  const seeds: SeedParams[] = [];
  let index = 0;
  while (index < (data.length - 1)) {
    seeds.push({ start: data[index], count: data[index+1] });
    index += 2;
  }
  return seeds;
}

function parseConversionParams(input: string): ConversionParams {
  const parts = input.split(' ').filter(Boolean).map(m => parseInt(m.trim()));
  if (parts.length !== 3) { throw new Error("Error parseConversionParams - invalid length - input should be 3 numbers"); }
  if (parts.some(m => isNaN(m))) { throw new Error("Error parseConversionParams - invalid value(s) - input should be 3 numbers"); }
  return {
    OutcomeStart: parts[0],
    SourceStart: parts[1],
    SourceRange: parts[2]
  };
}

function buildConversionFn(params: ConversionParams[]) {
  return (source: number) => {
    let result: number | null = null;
    for (let index = 0; index < params.length && result === null; index++) {
      const param = params[index];
      if (source >= param.SourceStart && source < (param.SourceStart + param.SourceRange)) {
        result = param.OutcomeStart + (source - param.SourceStart);
      }
    }

    return result ?? source;  //default to source if none of the param conditions were met.
  }
}


export async function day5b(dataPath?: string) {
  const data = await readData(dataPath);
  const { seeds, conversionMap } = parseDataInput(data);


  //change approach.... for each seed, iterate from seed to location and store seed and location of min

  let lowest = {seed: -1, location: Number.MAX_SAFE_INTEGER};
  seeds.forEach(s => {
    const {start, count} = s;
    verbose.add(`processing ${count} seeds: ${start}-${start+count-1}`).display();
    for (let seed=start; seed<start+count; seed++) {
      let temp = seed;
      categoryList.forEach(key => {
        temp = conversionMap[key](temp);
      });
      if (temp < lowest.location) {
        lowest = { seed, location: temp};
      }
    }
  })
  
  return lowest.location;
}


const answer = await day5b();
outputHeading(5, 'b');
outputAnswer(answer);
