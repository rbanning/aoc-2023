export const removeOperator = '-';
export const insertOperator = '=';

export const operators = [removeOperator, insertOperator] as const;
export type Operator = typeof operators[number];


export function isOperator(ch: string) {
  return operators.some(m => m === ch);
}
export function toOperator(ch: string): Operator {
  return ch as Operator;
}