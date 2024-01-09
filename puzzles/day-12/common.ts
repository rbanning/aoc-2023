export const damagedSpring = '#';
export const operationalSpring = '.';
export const unknownSpring = '?';
export const springChars = [damagedSpring, operationalSpring, unknownSpring] as const;
export type SpringChar = typeof springChars[number];
export type Springs = SpringChar[];

export type RecordRow = {
  springs: Springs,
  targetLengths: number[],
  //some approaches find the actual variants while others only count the number of variants
  variants?: Springs[],
  variantCount?: number,
}

export type SpringGroup = {
  springs: Springs,
  startIndex: number,
  variants?: Springs[]
}
const initSpringGroup = () => {
  return { springs: [], startIndex: -1 };
};

export function springsToGroups(springs: Springs): SpringGroup[] {
  let group: SpringGroup = initSpringGroup();
  return springs.reduce((result, curr, index) => {
    //add the group to the result if we find an operational spring 
    if (curr === operationalSpring) {
      if (group.springs.length > 0) { 
        result.push(group); 
        group = initSpringGroup(); 
     }
    } else {
      if (group.springs.length === 0) { group.startIndex = index; }
      group.springs.push(curr);
    }
    //add the group to the result if we are at the end
    if (index === (springs.length-1) && group.springs.length > 0) { result.push(group); }
    return result;
  }, [] as SpringGroup[]);
}

export function groupsToSprings(groups: SpringGroup[]): Springs {
  return groups.reduce((ret, curr) => {
    //pad with operational springs
    while (ret.length < curr.startIndex) { ret.push(operationalSpring); }
    ret = [...ret, ...curr.springs];
    return ret;
  }, [] as Springs);
}

export function recordIsValid(springs: Springs, targetLengths: number[]): boolean {
  const groups = springsToGroups(springs);
  let result = false;
  if (groups.length === targetLengths.length) {
    result = groups.every((group, index) => {
      return group.springs.length === targetLengths[index]
      && group.springs.every(ch => ch === damagedSpring);
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
