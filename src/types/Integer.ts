import type {Codec} from 'funtypes';
import {Number as N, Constraint, showValue} from 'funtypes';

export interface IntegerOptions {
  min?: number;
  max?: number;
}
export default function Integer({
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
}: IntegerOptions = {}): Codec<number> {
  if (min >= max) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  if (min < Number.MIN_SAFE_INTEGER) {
    throw new Error(
      `Expected min (${showValue(
        min,
      )}) to be greater than or equal to Number.MIN_SAFE_INTEGER (${showValue(
        Number.MIN_SAFE_INTEGER,
      )})`,
    );
  }
  if (max > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      `Expected max (${showValue(
        max,
      )}) to be less than or equal to Number.MAX_SAFE_INTEGER (${showValue(
        Number.MAX_SAFE_INTEGER,
      )})`,
    );
  }
  return Constraint(
    N,
    (value) => {
      if (value !== Math.floor(value) || value > max || value < min) {
        return `Expected an integer between ${showValue(min)} and ${showValue(
          max,
        )} but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `Integer`, args: {min, max}},
  );
}
