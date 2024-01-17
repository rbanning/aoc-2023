
export function generateHash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i++) {
    value += input.charCodeAt(i);
    value *= 17;
    value = value % 256;
  }
  return value;
}