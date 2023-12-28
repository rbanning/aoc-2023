import { arrayHelpers } from "../../helpers/arrayHelpers.ts";
import { Nullable } from "../../helpers/nullable.type.ts";
import { Verbose } from "../../shared.ts";
import { PipeMap } from "./pipe-map.ts";
import { Pipe, tileList } from "./pipe.ts";

export class Loop {
  start: Nullable<Pipe>;
  
  constructor(start?: Nullable<Pipe>) {
    this.start = start;
  }


  isValid() {
    const path = this.getPath();
    return path.length > 1 && arrayHelpers.getValue('last', path).isStart;
  }


  //returns array of pipes from Start to last
  getPath(): Pipe[] {
    const path = [];
    let current = this.start;
    while (current && (!current.isStart || path.length === 0)) {
      path.push(current);
      current = current.next;
    }
    return path;
  }

  stepsToFurthestPoint(): number {
    return Math.ceil(this.getPath().length / 2);
  }

  static findStart(map: PipeMap): Nullable<Pipe> {
    let possible = map.filter('S');
    if (possible.length > 0) {
      return possible[0];
    }
    return null;
  }

  

  static build(map: PipeMap): Loop {
    const verbose = new Verbose();
    const start = map.startPipe;

    if (!start) {
      throw new Error('Cannot build loop without a start pipe');
    }

    const loop = new Loop(start);

    //try all possible connectors for the start
    let done = false;
    for (let index = 0; index < tileList.length && !done; index++) {
      map.resetPipeConnectors();
      const tile = tileList[index];
      start.tile = tile;
      verbose.add(`Start (${start.coord.toString()}): trying ${tile} ...`);
      let current = start;
      while (current && !done && start.path().length < 100000) {
        //GET THE CONNECTING COORDINATE
        //if we are at the start, there should be two empty connectors,
        //  just pick the first.  If it is a loop, either will work.
        //if the start is on a boundary, there will be 0 or 1 connector
        //OTHERWISE there should only be one connector (or possibly zero if at boundary)
        const route = arrayHelpers.first(current.connectsTo(map.scope));
        if (current.isStart) {
          verbose.add(` heading to ${route.toString()}`).display()
        }
        if (route) {
          const next = map.find(route);
          done = !!next && start.coord.equals(next.coord); 
          if (next && current.canConnectTo(next)) {
            next.resetConnections();
            current.next = next;
            next.prev = current;
            current = next;  
          } else {
            current = null;
          }
        } else {
          current = null;
        }
      }
      
    }

    if (done) {
      let current = start;
      while(current) {
        current.isPartOfLoop = true;
        current = current.next;
        if (current && current.isStart) { current = null; }
      }
      if (Verbose.isActive()) {
        verbose.add(`  ended with a path of ${start.path().length} nodes - done = ${done}`).display();
        const {header, footer, body} = map.displayGrid(loop.start); // map.displayGrid(start, true);
  
        header.forEach(line => { verbose.add(line).display(); });
        body.forEach(line => { verbose.add(line).display({bright: true}); });
        footer.forEach(line => { verbose.add(line).display(); });
        verbose.newline().display();    
      }
    }

    return loop;
  }


  
}

