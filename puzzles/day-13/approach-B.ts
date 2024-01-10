import { Nullable } from "../../helpers/nullable.type.ts";
import { Verbose } from "../../shared.ts";
import { MirrorPattern, Grid, ReflectionIndices, deltaInCols, deltaInRows } from "./common.ts";


type FailedReflection = {
  indices: ReflectionIndices,
  count: number
}  

const TARGET_DIFFERENCES = 1;

function displayFailedReflection(failed: FailedReflection) {
  const [a,b] = failed.indices;
  new Verbose().add(`failed reflection: (${a},${b}) = ${failed.count}`).display();
}

// returns the a/b columns where reflection occurs if there is vertical reflection 
function checkVertical(grid: Grid): Nullable<ReflectionIndices> {

  if (grid.length === 0) { return null; }
  
  const width = grid[0].length;
  let a = 0;
  let b = a + 1;
  let ret: Nullable<ReflectionIndices>  = null;

  const differences: FailedReflection[] = [];

  while (b < width && !ret) {
    const diff: FailedReflection = { 
      indices: [a,b], 
      count: 0
    };
    differences.push(diff);

    let currA = a; let currB = b;
    while (currA >= 0 && currB < width && diff.count <= TARGET_DIFFERENCES) {
      diff.count += deltaInCols(grid, currA, currB, TARGET_DIFFERENCES);
      currA += -1; currB += 1; //move apart
    }

    if (diff.count === TARGET_DIFFERENCES) {
      ret = [a,b];
    } else {
      a += 1;
      b += 1;
    }
  }

  if (Verbose.isActive()) {
    new Verbose().add(`VERTICAL: ${differences.length} checks`).display();
    differences.forEach(meta => displayFailedReflection(meta));
  }

  return ret;
}

// returns the a/b rows where reflection occurs if there is horizontal reflection 
function checkHorizontal(grid: Grid): Nullable<ReflectionIndices> {

  if (grid.length === 0) { return null; }

  const height = grid.length;
  let a = 0;
  let b = a + 1;
  let ret: Nullable<ReflectionIndices>  = null;

  const differences: FailedReflection[] = [];

  while (b < height && !ret) {
    const diff: FailedReflection = { 
      indices: [a,b], 
      count: 0
    };
    differences.push(diff);

    let currA = a; let currB = b;
    while (currA >= 0 && currB < height && diff.count <= TARGET_DIFFERENCES) {
      diff.count += deltaInRows(grid, currA, currB, TARGET_DIFFERENCES);
      currA += -1; currB += 1; //move apart
    }

    if (diff.count === TARGET_DIFFERENCES) {
      ret = [a,b];
    } else {
      a += 1;
      b += 1;
    }
  }

  if (Verbose.isActive()) {
    new Verbose().add(`HORIZONTAL: ${differences.length} checks`).display();
    differences.forEach(meta => displayFailedReflection(meta));
  }

  return ret;
}


export function analyzePattern(grid: Grid): Nullable<Pick<MirrorPattern, "type" | "indices">> {
  let indices = checkVertical(grid);
  if (indices) { return { type: 'vertical', indices }; }
  //else
  indices = checkHorizontal(grid);
  if (indices) { return { type: 'horizontal', indices }; }
  //else
  return null;
}