import { Verbose } from "../shared.ts";
import { arrayHelpers } from "./arrayHelpers.ts";

// *** basic types ***
export type BinaryCompareFunction<T> = (a: T, b: T) => boolean;
export type Player = 'me' | 'you';

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


/*** Coins Game ***
 * 
 *  Two (2) player game where players alternate choosing either the first or last coin in the sequence
 *    Winner is the one who gets the highest sum of the values of the coins
 *  Problem = which coin (first or last) to pick to maximize my end value
 * 
 *  example:  5 10 100 25
 *    me: 5, you: 25, me: 100, you: 10
 *      me: 5 + 100 = 105
 *      you: 25 + 10 = 35
 *    
 */
export class CoinGame {


  public static solveBasic(coins: number[]): number[] {
    return this.play(coins, 'me');  //I always go first!
  }
  private static play(coins: number[], player: Player): number[] {
    if (coins.length === 0) { return []; }

    let first: number[]; let last: number[];

    if (player === 'me') {
      first = [arrayHelpers.first(coins), ...this.play(coins.slice(1), 'you')];
      last = [arrayHelpers.last(coins), ...this.play(coins.slice(0, coins.length-1), 'you')];
      return this.sum(first) > this.sum(last) ? first : last;   // max
    } else {
      player === 'you'
      first = this.play(coins.slice(1), 'me');
      last = this.play(coins.slice(0, coins.length-1), 'me');
      return this.sum(first) < this.sum(last) ? first : last;   // min
    }
  }

  private static sum(a: number[]) {
    return a.reduce((sum, curr) => sum + curr, 0);
  }
}
