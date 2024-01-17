import { Store } from "../../helpers/store.ts";
import { CharRow, Grid } from "./common.ts";

export class Day14Cache {
  private _store: Store<CharRow>;

  constructor() {
    this._store = new Store<CharRow>(
      (row: CharRow) => row.join(''),
      (toFront: boolean) => `${toFront}`
    );
  }
  

  get(row: CharRow, toFront: boolean) { return this._store.get(row, toFront); }
  add(value: CharRow, row: CharRow, toFront: boolean) { return this._store.add([...value], row, toFront); }
  hasKey(row: CharRow, toFront: boolean) { return this._store.hasKey(row, toFront); }
  key(row: CharRow, toFront: boolean) { return this._store.key(row, toFront); }


}

type KeyValuePair = {
  key: string;
  value: number;
}

export class Day14GridCache {
  private _store: KeyValuePair[] = [];

  get length() { return this._store.length; }

  add(grid: Grid, load: number) { this._store.push({key: this.key(grid), value: load}) }
  indexOf(grid: Grid) { 
    const key = this.key(grid);
    return this._store.findIndex(pair => pair.key === key); 
  }
  get(index: number) {
    return this._store[index];
  }
  getGrid(index: number) {
    const {key} = this._store[index];
    return key.split('|').map(row => row.split('')) as Grid;
  }
  
  key(grid: Grid) { return grid.map(row => row.join('')).join('|'); }

}