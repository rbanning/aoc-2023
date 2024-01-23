//NOTE: including aliases to common CS properties/methods names

/** PriorityQueueComparerFn **
*
* function used to compare two items in a PriorityQueue
*   return positive number if a has higher priority than b
*   return negative number if a has lower priority than b
*   return zero (0) if a and b have the same priority
*/
export type PriorityQueueComparerFn<T> = (a: T, b: T) => number;

function genericPriorityQueueComparerFn<T>(): PriorityQueueComparerFn<T> {
  return (a: T, b: T) => {
    return a > b ? 1 
      : (a < b ? -1 : 0); 
  }
}

export class PriorityQueue<T> {
  protected _items: T[] = [];
  protected comparerFn: PriorityQueueComparerFn<T>;

  constructor(comparerFn?: PriorityQueueComparerFn<T>) {
    this.comparerFn = comparerFn ?? genericPriorityQueueComparerFn();
  }

  get size() { return this.length; }
  get length() {
    return this._items.length;
  }

  isEmpty() {
    return this.length === 0;
  }

  enqueue(...items: T[]) { return this.add(...items); }
  add(...items: T[]): PriorityQueue<T> {
    items.forEach(item => {
      this.addItem(item);
    });
    return this;
  }

  dequeue() { return this.next(); }
  next(): T | null {
    if (this.isEmpty()) { return null; }
    
    //else
    return this._items.shift();
  }

  clear(): PriorityQueue<T> {
    this._items = [];
    return this;
  }

  //following return values but do not mutate queue

  front(): T | null {
    if (this.isEmpty()) { return null; }

    //else
    return this.at(0);
  }
  rear(): T | null {
    if (this.isEmpty()) { return null; }

    //else
    return this.at(this.length-1);
  }
  at(index: number): T | null {
    if (index >= 0 && index < this.length) {
      return this._items[index];
    }
    //else
    return null;
  }


  //#region --- helpers ---

  protected addItem(item: T) {
    let i = 0;
    while(i < this.length && this.comparerFn(item, this.at(i)) < 0) {
      i += 1;
    }
    this._items.splice(i, 0, item);
  }

  //#endregion
}