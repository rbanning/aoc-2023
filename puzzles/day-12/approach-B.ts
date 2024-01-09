/** APPROACH B : RECURSION w/ added edge cases **
 *  
 * gave up and implemented version from https://github.com/hiimjustin000/advent-of-code/blob/master/2023/day12/part2.js
 * 
 * this implementation only returns the number of variants (not the actual variants).
 * 
 * **/

import { Store } from "../../helpers/store.ts";
import { Verbose } from "../../shared.ts";
import { SpringChar, Springs, damagedSpring, operationalSpring } from "./common.ts";

export function buildCacheStore() {
  return new Store<number>(
    (value: Springs) => { return value.join(''); },
    (value: number[]) => { return value.join(','); },
  );
}

const cache = buildCacheStore();

function removeFromFront(springs: Springs, char: SpringChar = operationalSpring) {
  while (springs.length > 0 && springs[0] !== char) {
    springs = springs.slice(1);
  }
  return springs;
}

export function calcVariants(springs: Springs, targetLengths: number[]): number {
  //have we already done this?
  if (cache.hasKey(springs, targetLengths)) { return cache.get(springs, targetLengths); }

  //todo: what are we doing here (original return Number(!springs.includes("#")); )
  if (targetLengths.length <= 0) { return springs.includes(damagedSpring) ? 0 : 1; }
  
  const totalTargets = targetLengths.reduce((sum, curr) => sum + curr, 0);

  //check to see if there is enough springs to handle the targets and their separators
  if (springs.length - totalTargets - (targetLengths.length - 1) < 0) { 
    return 0; //bail
  }

  //
  const firstTarget = targetLengths[0];

  //are the next X springs only damage or unknown (where X is the first target length)
  const damagedOrUnknown = !springs.slice(0, firstTarget).includes(operationalSpring);

  //if there are only X springs left (where X is the first target length)
  if (springs.length === firstTarget) {
    return damagedOrUnknown ? 1 : 0;
  }

  let result = 0;
  if (springs[0] !== damagedSpring) {
    result += calcVariants(removeFromFront(springs.slice(1)), targetLengths);
  }  
  if (damagedOrUnknown && springs[firstTarget] !== damagedSpring) {
    result += calcVariants(removeFromFront(springs.slice(firstTarget + 1)), targetLengths.slice(1));
  }

  cache.add(result, springs, targetLengths);

  return result;
}

