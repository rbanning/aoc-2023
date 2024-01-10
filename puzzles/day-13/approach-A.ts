import { Nullable } from "../../helpers/nullable.type.ts";
import { MirrorPattern, Grid, ReflectionIndices } from "./common.ts";

// returns the a/b columns where reflection occurs if there is vertical reflection 
function checkVertical(grid: Grid): Nullable<ReflectionIndices> {

  if (grid.length === 0) { return null; }

  const width = grid[0].length;
  let a = 0;
  let b = a + 1;
  let ret: Nullable<ReflectionIndices>  = null;
  while (a < width && b < width && !ret) {
    let ok = true;  
    for (let row = 0; row < grid.length && ok; row++) {
      let left = a; let right = b;
      while (ok && left >= 0 && right < width) {
        if (grid[row][left] === grid[row][right]) {
          left += -1; right += 1;
        } else {
          ok = false;
        }
      }
    }    
    if (ok) {
      ret = [a,b];
    } else {
      a += 1;
      b += 1;
    }
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
  while (a < height && b < height && !ret) {
    let ok = true;  
    for (let col = 0; col < grid.length && ok; col++) {
      ok = grid[a][col] === grid[b][col];  
      let top = a; let bottom = b;
      while (ok && top >= 0 && bottom < height) {
        if (grid[top][col] === grid[bottom][col]) {
          top += -1; bottom += 1;
        } else {
          ok = false;
        }
      }
    }    
    if (ok) {
      ret = [a,b];
    } else {
      a += 1;
      b += 1;
    }
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