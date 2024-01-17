import { generateHash } from "./approach-A.ts";
import { Operator, insertOperator, isOperator, removeOperator, toOperator } from "./common.ts";

export type Lens = {
  label: string,
  location: number,
  operator: Operator,
  focalLength: number,
}

export type BOX = Lens[];


export function generateBoxes(steps: string[]): BOX[] {
  const boxes = initializeBoxes();
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const lens = parseStep(step);

    if (lens.operator === removeOperator) {
      removeLens(boxes, lens);
    } else if (lens.operator === insertOperator) {
      insertLens(boxes, lens);
    } else {
      throw new Error(`Invalid operator found: ${lens.operator} in step: '${step}'`);
    }    
  }
  
  return boxes;
}

export function valueOfLensesInBox(box: BOX) {
  return box.reduce((sum, lens, index) => {
    sum += valueOfLens(lens.location, index, lens.focalLength);
    return sum;
  }, 0);
}

function valueOfLens(boxIndex: number, slotIndex: number, focalLength: number) {
  return (boxIndex + 1) * (slotIndex + 1) * focalLength;
}


function initializeBoxes(count: number = 256) {
  return Array(count).fill(null).map(_ => [] as Lens[]) as BOX[];
}

function removeLens(boxes: BOX[], lens: Lens) {
  const index = boxes[lens.location].findIndex(b => b.label === lens.label);
  if (index >= 0) {
    boxes[lens.location].splice(index, 1);
  }
}

function insertLens(boxes: BOX[], lens: Lens) {
  const index = boxes[lens.location].findIndex(b => b.label === lens.label);
  if (index >= 0) {
    boxes[lens.location][index] = lens;
  } else {
    //add
    boxes[lens.location].push(lens);
  }
}

function parseStep(step: string) {
  let index = 0;
  while (index < step.length && !isOperator(step[index])) {
    index++;
  }
  if (index >= step.length) { throw new Error(`could not locate operator in ${step}`); }
  //else
  const operator = toOperator(step[index]);
  const [label, value] = step.split(operator);
  
  const ret: Lens = {
    label,
    operator,
    location: generateHash(label),
    focalLength: 0
  }
  if (ret.operator === insertOperator) {
    ret.focalLength = parseInt(value);
  }
  return ret;
}


