import type {Codec} from 'funtypes';
import {Number as N, Constraint, showValue} from 'funtypes';

export interface FloatOptions {
  min?: number;
  max?: number;
}
export default function Float({min, max}: FloatOptions = {}): Codec<number> {
  if (min !== undefined && isNaN(min)) {
    throw new Error(`Expected min (${showValue(min)}) to be a number`);
  }
  if (max !== undefined && isNaN(max)) {
    throw new Error(`Expected max (${showValue(max)}) to be a number`);
  }
  if (min !== undefined && max !== undefined && min >= max) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  return Constraint(
    N,
    (value) => {
      if (Number.isNaN(value)) {
        return `NaN is not a valid number`;
      }
      if (min !== undefined && value < min) {
        return `Expected value to be greater than or equal to ${showValue(
          min,
        )} but got ${showValue(value)}`;
      }
      if (max !== undefined && value > max) {
        return `Expected value to be less than or equal to ${showValue(
          max,
        )} but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `Float`, args: {min, max}},
  );
}
