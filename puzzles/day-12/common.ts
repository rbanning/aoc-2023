export const damagedSpring = '#';
export const operationalSpring = '.';
export const unknownSpring = '?';
export const springChars = [damagedSpring, operationalSpring, unknownSpring] as const;
export type SpringChar = typeof springChars[number];
export type Springs = SpringChar[];

export type RecordRow = {
  springs: Springs,
  recordedGroupings: number[],
  variants?: Springs[];
}


export function springsToGroups(springs: Springs): Springs[] {
  let group: Springs = [];
  return springs.reduce((result, curr, index) => {
    //add the group to the result if we find an operational spring 
    if (curr === operationalSpring) {
      if (group.length > 0) { 
        result.push(group); 
        group = []; 
     }
    } else {
      group.push(curr);
    }
    //add the group to the result if we are at the end
    if (index === (springs.length-1) && group.length > 0) { result.push(group); }
    return result;
  }, [] as Springs[]);
}

export function groupsToSprings(groups: Springs[]): Springs {
  return groups.map((g, index) => {
    return (index > 0) ? [operationalSpring, ...g] : g;
  }).flat() as Springs;
}

export function recordIsValid(springs: Springs, targetLengths: number[]): boolean {
  const groups = springsToGroups(springs);
  let result = false;
  if (groups.length === targetLengths.length) {
    result = groups.every((group, index) => {
      return group.length === targetLengths[index]
      && group.every(ch => ch === damagedSpring);
    })
  }   
  return result; 
}

export function countOf(char: SpringChar | SpringChar[], springs: Springs): number {
  if (Array.isArray(char)) {
    return springs.reduce((sum, ch) => sum + (char.includes(ch) ? 1 : 0), 0);
  }
  //else ... only one char
  return springs.reduce((sum, ch) => sum + (ch === char ? 1 : 0), 0);
}

export function replaceAll(springs: Springs, target: SpringChar, replacement: SpringChar) {
  return springs.map(ch => ch === target ? replacement : ch);
}
