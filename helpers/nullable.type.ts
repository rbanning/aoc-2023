export type Nullable<T> = T | null | undefined;
export type IsNullable = null | undefined;

export function isNullable(value: unknown): value is IsNullable {
  return (value === null || value === undefined || typeof(value) === 'undefined');
}

export function isNotNullable<T>(value: unknown): value is T {
  return !isNullable(value);
}