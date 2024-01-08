/** APPROACH B : RECURSION w/ added edge cases **
 *  
 * if the established part of the pattern doesn't match, we can just bail

 * if there are not enough ? left to get the number of # up to the number required by the pattern, we can just bail

 * if the number of # required is equal do the number of ? left, all remaining ? must be #, same logic as above

 * if we've already got the requisite number of # implied by the pattern, all remaining ? must be . and there's no need to recursively get there -- we can just do a replace and evaluate.
 * 
 * **/

import { arrayHelpers } from "../../helpers/arrayHelpers.ts";
import { Store } from "../../helpers/store.ts";
import { Verbose } from "../../shared.ts";
import { Springs, operationalSpring, damagedSpring, unknownSpring, replaceAll, countOf, recordIsValid, springsToGroups, groupsToSprings } from "./common.ts";


export type Cache = {
  totalDamaged: number,
  known: Store<Springs[]>
}

export function buildCacheStore() {
  return new Store<Springs[]>(
    (value: Springs) => { return value.join(''); },
    (value: number[]) => { return value.join(','); },
  );
}

const cache: Cache = {
  totalDamaged: 0,
  known: buildCacheStore()
};

function preflight(springs: Springs, targetLengths: number[]): Springs[] {
  let groups = springsToGroups(springs);  //returns groups of damaged or unknown springs (no operational springs)
  
  //* if the number of groups === number of target lengths, just return groups filled with damaged
  if (groups.length === targetLengths.length) {
    return groupsToSprings(groups.map((_,index) => arrayHelpers.create(targetLengths[index], damagedSpring)));
  }

  //* if the number of groups > target lengths, then there is something wrong ... bail
  if (groups.length > targetLengths.length) {
    return [];
  }

  //* for each group, ....
  groups = groups.map((g, index) => {
    //if the number of springs equals the required length, replace all with damaged
    if (g.length === targetLengths[index]) {
      return g.map(x => damagedSpring);
    }

    //if the number of damaged springs equals the required length, replace unknown with operational
    if (countOf(damagedSpring, g) === targetLengths[index]) {
      return g.map(x => x === damagedSpring ? damagedSpring : operationalSpring);
    }

    //else
    return g;
  });
  
  return groupsToSprings(groups);
}

export function calcVariants(springs: Springs, targetLengths: number[], index: number): Springs[] {
  //get the total number of damaged (#) required (only on the initial run (i.e. index === 0)) 
  if (index === 0) {
    cache.totalDamaged = targetLengths.reduce((sum, len) => sum + len, 0);

    //todo: combine the three lines into one (removing debug)
    const temp = preflight(springs, targetLengths);
    new Verbose().add(`${springs.join('')} ==> ${temp.join('')}`).display();
    springs = temp;
  }

  //check edge cases...

  //* if nothing more to do (i.e. index is beyond the end), check and return
  if (index === springs.length) {
    //stop --- nothing to check
    return checkAndSave(springs, targetLengths);
  }

  //* if already in cache
  if (cache.known.hasKey(springs, targetLengths)) {
    new Verbose().add(` *** found item in cache: ${springs.join('')}`).display();
    return cache.known.get(springs, targetLengths);
  }

  const totals = {
    damagedSpring: countOf(damagedSpring, springs),
    unknownSpring: countOf(unknownSpring, springs)
  };

  //* if there are not enough ? left to get the total number of # required,  bail
  if ((totals.damagedSpring + totals.unknownSpring) < cache.totalDamaged) { 
    return checkAndSave(springs, targetLengths);  //fail
  }
  
  //* if the number of # required is equal do the number of ? left, all remaining ? must be #, -- replace and check
  if ((totals.damagedSpring + totals.unknownSpring) === cache.totalDamaged) { 
    return checkAndSave(replaceAll(springs, unknownSpring, damagedSpring), targetLengths);
  }

  //* if we've already got the requisite number of #, all remaining ? must be . --  replace and check
  if (totals.damagedSpring === cache.totalDamaged) {
    return checkAndSave(replaceAll(springs, unknownSpring, operationalSpring), targetLengths);
  }



  

  const char = springs[index];
  switch (char) {
    case operationalSpring:
      case damagedSpring:
      //otherwise just ignore the char and continue
      return calcVariants(springs, targetLengths, index+1);

    case unknownSpring:
      //try replacing with operational and damaged
      const a = [...springs]; a[index] = operationalSpring;
      const b = [...springs]; b[index] = damagedSpring;
      return [
        ...calcVariants(a, targetLengths, index+1),
        ...calcVariants(b, targetLengths, index+1),
      ];
    
    default: 
      throw new Error(`Found unknown spring char '${char}'`);
  }
}

//helper function
//  if the springs are valid, then save to the cache and return
//  otherwise, return empty array []
function checkAndSave(springs: Springs, targetLengths: number[]) {
  if (springs.length && recordIsValid(springs, targetLengths)) {
    cache.known.add([springs], springs, targetLengths);
    return  [springs];
  }
  //else
  return [];
}