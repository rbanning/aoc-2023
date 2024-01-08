/** APPROACH A : BASIC RECURSION **
 * 
 * 
 * 
 * **/

import { Springs, recordIsValid, operationalSpring, damagedSpring, unknownSpring } from "./common.ts";


export function calcVariants(springs: Springs, targetLengths: number[], index: number): Springs[] {
  
  // verbose.add(`   calcVariants(springs: '${springs.join('')}', targets: [${targetLengths}], index: ${index})`).display();

  if (index === springs.length) {
    //stop --- nothing to check
    return recordIsValid(springs, targetLengths) ? [springs] : [];
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