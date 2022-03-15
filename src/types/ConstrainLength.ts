import type {Codec} from 'funtypes';
import {Constraint, showValue} from 'funtypes';

export interface ConstrainLengthOptions {
  min?: number;
  max?: number;
}
export default function ConstrainLength<T extends {readonly length: number}>(
  base: Codec<T>,
  {min = 0, max = Number.MAX_SAFE_INTEGER}: ConstrainLengthOptions = {},
): Codec<T> {
  if (min >= max) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  if (min < 0) {
    throw new Error(
      `Expected min (${showValue(min)}) to be greater than or equal to 0`,
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

  return Constraint(base, (value) => {
    if (value.length < min || value.length > max) {
      return `Expected length to be between ${showValue(min)} and ${showValue(
        max,
      )}, but length was ${showValue(value.length)}`;
    }
    return true;
  });
}
