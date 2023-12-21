import { ArrayBound, NamedArrayBound, arrayHelpers } from '../../helpers/arrayHelpers.ts';
import { readData, outputHeading, outputAnswer, Verbose } from '../../shared.ts';
Verbose.setActive(false);
const verbose = new Verbose();



class Sequence {
  private _data: number[][];
  get initial() {
    if (this._data.length) {
      return [...this.getRow('first')];    //copy
    }
    //else
    return [];
  }
  get rows() {
    if (this._data.length) {
      return [...this._data.map(m => [...m])];
    }
    //else
    return [];
  }

  get isDone() {
    if (this._data.length) {
      return this.getRow('last').every(v => v === 0);
    }
    //else
    return false;
  }

  constructor(initial: number[]) {
    this.process(initial);
  }

  process(initial: number[]) {
    //reset 
    this._data = [initial];
    while (!this.isDone) {
      const row = this.getRow('last');
      const differences: number[] = [];
      if (row.length > 1) {
        for (let index = 1; index < row.length; index++) {
          differences.push(row[index] - row[index-1]);
        }
      }
      this._data.push(differences);
    }
  }


  nextValue(index: ArrayBound): number {
    if (this.isDone) {
      index = arrayHelpers.parseIndex(index, this._data);

      if (index === arrayHelpers.lastIndex(this._data)) { return 0; }
      //else
      const row = this.getRow(index);
      return arrayHelpers.getValue(arrayHelpers.lastIndex(row), row)
               + this.nextValue(index + 1);
    }

    return NaN;
  }

  previousValue(index: ArrayBound): number {
    if (this.isDone) {
      index = arrayHelpers.parseIndex(index, this._data);

      if (index === arrayHelpers.lastIndex(this._data)) { return 0; }
      //else
      const row = this.getRow(index);
      return arrayHelpers.getValue(0, row)
               - this.previousValue(index + 1);
    }

    return NaN;
  }



  //#region >> HELPERS <<

  private getRow(index: ArrayBound): number[] {
    return arrayHelpers.getValue(index, this._data);
  }

  //#endregion
}



export async function day9b(dataPath?: string) {
  const data = await readData(dataPath);

  const sequenceSet: Sequence[] = data.map(line => {
    const numbers = line.split(' ')
      .map(m => m.trim())
      .filter(Boolean)
      .map(m => parseInt(m));
    return new Sequence(numbers);
  })

  let total = 0;
  sequenceSet.forEach((seq, i) => {
    total += seq.previousValue('first');
    if (Verbose.isActive()) {
      verbose.add(`sequence #${i+1}`).display();
      seq.rows.forEach((r, index) => {
        verbose
          .add(`(${seq.previousValue(index)}), `)
          .add(r.join(', '))
          .add(`, (${seq.nextValue(index)})`)
          .display();
      });
    }
  })
  
  return total;
}

const answer = await day9b();
outputHeading(9, 'b');
outputAnswer(answer);
