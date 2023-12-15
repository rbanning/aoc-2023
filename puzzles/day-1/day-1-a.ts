import { readData, outputHeading, outputAnswer } from '../../shared.ts';

type CalibrationTuple = [number, number];

function extractCalibrationTuple(text: string): CalibrationTuple {
  if (!text) {
    throw new Error('Unable to extract calibration value - empty input');
  }

  const chars = text.split('');
  const result = chars.reduce((ret, curr) => {
    const value = parseInt(curr);
    if (!isNaN(value)) {      
      if (isNaN(ret[0])) {
        ret[0] = value;
      }
      ret[1] = value;
    }
    return ret;
  }, [NaN, NaN] as CalibrationTuple);

  if (isNaN(result[0]) || isNaN(result[1])) {
    throw new Error('Unable to extract calibration value - invalid input - ' + text);
  }

  //else
  return result;
}

function calibrationTupleToValue(tuple: CalibrationTuple) {
  return tuple[0] * 10 + tuple[1];
}



export async function day1a(dataPath?: string) {
  const data = (await readData(dataPath)).filter(Boolean);  //remove any empty lines
  const values = data.map(line => {
    return calibrationTupleToValue(extractCalibrationTuple(line));
  });
  return values.reduce((sum, curr) => {
    sum += curr;
    return sum;
  }, 0);  
}

const answer = await day1a();
outputHeading(1, 'a');
outputAnswer(answer);

