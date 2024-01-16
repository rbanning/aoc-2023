import { Nullable } from "./nullable.type.ts";

export type ObjectToString = (obj: unknown) => string;

export interface IStore<T> {
  length: number;
  get(...params: unknown[]): Nullable<T>;
  add(value: T, ...params: unknown[]): boolean;
  hasKey(...params: unknown[]): boolean;
  key(...params: unknown[]): string;
  keys(): string[];
  clear(): void;
}

export class Store<T> implements IStore<T> {
  private _store: {[key: string]: T} = {};
  private _keyFns: ObjectToString[];

  get length(): number {
    return this.keys().length;
  }

  constructor(...fn: ObjectToString[]) {
    this._keyFns = fn;
  }


  get(...params: unknown[]): Nullable<T> {
    return this.hasKey(...params) ? this._store[this.key(...params)] : undefined;
  }


  add(value: T, ...params: unknown[]): boolean {
    this._store[this.key(...params)] = value;
    return true;
  }

  hasKey(...params: unknown[]): boolean {
    return (this.key(...params) in this._store);
  }

  key(...params: unknown[]): string {
    if (params.length > this._keyFns.length) { throw new Error(`Store.key() error: too many parameters provided (${params.length}).  We only have ${this._keyFns.length} key converter functions.`); }

    return params.map((p, index) => {
      try {
        return this._keyFns[index](p);
      } catch (error) {
        throw new Error(`Store.key() error: error converting param #${index} - ${error.message ?? error}`);
      }
    }).join('|');
  }

  keys(): string[] {
    return Object.keys(this._store);
  }

  clear() {
    this._store = {};
  }

}

