export const north = 'N'; 
export const south = 'S';
export const east = 'E';
export const west = 'W';
export const directions = [north, south, east, west] as const;
export type Direction = typeof directions[number];

export function isVerticalDirection(direction: Direction) {
  return direction === north || direction === south;
}
export function isHorizontalDirection(direction: Direction) {
  return direction === east || direction === west;
}
export function isReverseDirection(direction: Direction) {
  return (direction === south || direction === east);
}
