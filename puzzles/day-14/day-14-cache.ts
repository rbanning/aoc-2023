import { Store } from "../../helpers/store.ts";
import { CharRow } from "./common.ts";

export class Day14Cache {
  private _store: Store<CharRow>;

  constructor() {
    this._store = new Store<CharRow>(
      (row: CharRow) => row.join(''),
      (toFront: boolean) => `${toFront}`
    );
  }

  get(row: CharRow, toFront: boolean) { return this._store.get(row, toFront); }
  add(value: CharRow, row: CharRow, toFront: boolean) { return this._store.add(value, row, toFront); }
  hasKey(row: CharRow, toFront: boolean) { return this._store.hasKey(row, toFront); }

}