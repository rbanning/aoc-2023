import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';

type CalibrationTuple = [number, number];
type ReplacementLookupDict = string[];

const verbose = new Verbose();
const digitLookup: ReplacementLookupDict = ["zero","one","two","three","four","five","six","seven","eight","nine"];


function extractDigit(text: string, start: 'front' | 'end'): number {
  let index: number = start === 'front' ? 0 : (text.length-1);
  const delta: number = start === 'front' ? 1 : -1;

  let value = NaN;
  while (isNaN(value) && index >= 0 && index < text.length) {
    const current = text.substring(index);
    value = parseInt(current[0]); //check the first digit
    if (isNaN(value)) {
      //check for spelled out digits
      for (let lookupIndex = 0; lookupIndex < digitLookup.length && isNaN(value); lookupIndex++) {
        if (current.startsWith(digitLookup[lookupIndex])) {
          value = lookupIndex;
        }
      }
    }

    index += delta;
  }

  return value;
}

function extractCalibrationTuple(text: string): CalibrationTuple {
  if (!text) {
    throw new Error('Unable to extract calibration value - empty input');
  }

  verbose.add(`> ${text}`);
  const result: CalibrationTuple = [extractDigit(text, 'front'), extractDigit(text, 'end')];

  if (isNaN(result[0]) || isNaN(result[1])) {
    throw new Error('Unable to extract calibration value - invalid input - ' + text);
  }

  //else
  verbose.add(` [${result[0]},${result[1]}] `);
  return result;
}

function calibrationTupleToValue(tuple: CalibrationTuple) {
  const value = tuple[0] * 10 + tuple[1];
  verbose.add(` = ${value}`).display();
  return value;
}



export async function day1b(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);  //remove any empty lines
  const values = data.map(line => {
    return calibrationTupleToValue(
      extractCalibrationTuple(line));
  });
  return values.reduce((sum, curr) => {
    return sum + curr;
  }, 0);  
}

Verbose.setActive(false);
const answer = await day1b();
outputHeading(1, 'b');
outputAnswer(answer);


