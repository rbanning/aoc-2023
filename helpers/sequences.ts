import { Verbose } from "../shared.ts";

// *** basic types ***
export type BinaryCompareFunction<T> = (a: T, b: T) => boolean;


/*** Longest Common Sequence ***
 * 
 *  given two sequences A and B, return the longest set of elements that are common to both A and B, 
 *    and that are in sequence (result appears in consecutive position in both A and B)
 *  example:
 *    A: hieroglyphology
 *    B: michaelangelo
 *    LCS(A,B) = hello
 * 
**/
export class LCS {
  public static generalEQ<T>(): BinaryCompareFunction<T> {
    return (a: T, b: T) => a === b;
  }

  //NOTE: using the "suffix" approach
  //      this means we recurse on A[:i] (remainder of the array from i)
  public static solveBasic<T>(arrA: T[], arrB: T[], equalsFn?: BinaryCompareFunction<T>): T[] {
    equalsFn = equalsFn ?? this.generalEQ();

    // base case: either of the arrays are empty, stop and return empty sequence
    if (!arrA.length || !arrB.length) { return []; }

    const i = 0;

    // element at index in each array are equal, that element is in the LCS
    if (equalsFn(arrA[i], arrB[i])) {
      return [arrA[i], ...this.solveBasic(arrA.slice(i+1), arrB.slice(i+1), equalsFn)];
    }

    //else 
    const option1 = this.solveBasic(arrA, arrB.slice(i+1),equalsFn);
    const option2 = this.solveBasic(arrA.slice(i+1), arrB, equalsFn);
    return option1.length > option2.length ? option1 : option2;
  } 
}


/*** Longest Increasing SubSequence ***
 * 
 *  given a sequence A, return the longest set of elements that are increasing, 
 *    and that are in sequence (result appears in consecutive position in A)
 *  example:
 *    A: carbohydrate
 *    LIS(A) = abort
 * 
**/
export class LIS {
  public static generalGT<T>(): BinaryCompareFunction<T> {
    return (a: T, b: T) => a > b;
  }


  //NOTE: using the "suffix" approach
  //      this means we recurse on A[:i] (remainder of the array from i)
  public static solveBasic<T>(arrA: T[], greaterThanFn?: BinaryCompareFunction<T>): T[] {
    greaterThanFn = greaterThanFn ?? this.generalGT();

    // base case: either of the arrays are empty, stop and return empty sequence
    if (!arrA.length) { return []; }

    const aIndex = 0;
    const jDelta = 1;
    let j =  aIndex+1;
    
    let options: T[][] = [];
    while (j < arrA.length) {
      if (greaterThanFn(arrA[j], arrA[aIndex])) {
        options = [
          ...options,
          this.solveBasic(arrA.slice(j), greaterThanFn)
        ];
      }
      //next
      j += jDelta;
    }
    
    const max = options.reduce((ret, curr) => {
      return (curr.length > ret.length) ? curr : ret;
    }, [])

    return [arrA[aIndex], ...max]; 
  } 
}


