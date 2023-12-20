export function primeFactors(n: number) {
  //require integer
  if (!Number.isInteger(n)) { throw new Error(`Error calculating prime factors of ${n} - not an integer`); }
  const original = n; //save

  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
      if (!Number.isInteger(n)) { throw new Error(`Error calculating prime factors of ${original} - ${n} is not an integer`); }
    } else {
      divisor++;
    }
  }
  return factors;
}

export function greatestCommonFactor(...values: number[]): number {
  if (values.length === 0) { throw new Error(`Unable to calculate the GCF of no numbers}`); }
  if (values.length === 1) { throw new Error(`Unable to calculate the GCF of a single number: ${values[0]}`); }
  else if (values.length === 2) {
    const [a,b] = values;
    return a ? greatestCommonFactor(b % a, a) : b;
  }
  //else
  const first = values.shift();
  return greatestCommonFactor(first, greatestCommonFactor(...values));
}

export function leastCommonMultiple(...values: number[]): number {
  if (values.length === 0) { throw new Error(`Unable to calculate the LCM of no numbers}`); }
  if (values.length === 1) { throw new Error(`Shouldn't need to calculate the LCM of a single number: ${values[0]}`); }
  else if (values.length === 2) {
    const [a,b] = values;
    return a * b / greatestCommonFactor(a, b);
  }
  //else
  return values.reduce((a, b) => leastCommonMultiple(a,b), 1);
}
