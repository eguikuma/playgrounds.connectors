export const equal = (a: number, b: number) => a === b

export const greaterThan = (value: number, min: number) => value > min

export const greaterThanOrEqual = (value: number, min: number) => value >= min

export const lessThan = (value: number, max: number) => value < max

export const lessThanOrEqual = (value: number, max: number) => value <= max

export const between = (value: number, { from, to }: { from: number; to: number }) =>
  value >= from && value < to
