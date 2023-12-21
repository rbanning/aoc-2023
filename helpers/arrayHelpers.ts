export type NamedArrayBound = 'first' | 'last';
export type ArrayBound = number | NamedArrayBound;


function parseNamedIndex(index: NamedArrayBound, arr: unknown[]): number {
  return index === 'first' ? 0 : lastIndex(arr);
}

function parseIndex(index: ArrayBound, arr: unknown[]): number {
  if (typeof(index) === 'number') { return index; }
  //else
  return parseNamedIndex(index, arr);
}

function lastIndex(arr: unknown[]): number {
  return Array.isArray(arr) ? arr.length -1 : NaN;
}

function inBounds(index: ArrayBound, arr: unknown[]): boolean {
  if (Array.isArray(arr)) {
    if (typeof(index) === 'number') {
      return index >= 0 && index < arr.length;
    }
    //else
    return inBounds(parseNamedIndex(index, arr), arr);
  }
  //not a valid array
  throw new Error(`Error - expected an array but received ${typeof(arr)}`);
}

function getValue<T>(index: ArrayBound, arr: T[]): T {
  if (typeof(index) === 'number') {
    if (!inBounds(index, arr)) { throw new Error(`Unable to get array value - index (${index}) is out of bounds`); }
    return arr[index];
  }
  //else
  return getValue(index === 'first' ? 0 : lastIndex(arr), arr);
}



export const arrayHelpers = {
  parseIndex,
  lastIndex,
  inBounds,
  getValue
}