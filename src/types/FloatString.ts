import type {Codec} from 'funtypes';
import {String as S, Constraint, showValue} from 'funtypes';

const A_IS_SMALLER = -1;
const B_IS_SMALLER = 1;
const EQUAL = 0;

interface SplitNumber {
  isNegative: boolean;
  magnitude: string;
  decimal: string;
}
export interface FloatStringOptions {
  min?: string;
  max?: string;
}
export default function FloatString({
  min,
  max,
}: FloatStringOptions = {}): Codec<string> {
  const sMin = min === undefined ? undefined : splitNumber(min);
  const sMax = max === undefined ? undefined : splitNumber(max);
  if (sMin && sMax && compare(sMin, sMax) !== A_IS_SMALLER) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  return Constraint(
    S,
    (value) => {
      if (!/^(0|\-?[1-9]\d*)(\.\d+)?$/.test(value)) {
        return `Expected a numeric string but got ${showValue(value)}`;
      }
      if (!sMin && !sMax) return true;
      const sValue = splitNumber(value);
      if (sMin && compare(sMin, sValue) === B_IS_SMALLER) {
        return `Expected a value greater than or equal to ${showValue(
          min,
        )} but got ${showValue(value)}`;
      }
      if (sMax && compare(sValue, sMax) === B_IS_SMALLER) {
        return `Expected a value less than or equal to ${showValue(
          max,
        )} but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `FloatString`, args: {min, max}},
  );
}

function splitNumber(value: string): SplitNumber {
  const isNegative = value.startsWith(`-`);
  const wholeMagnitude = isNegative ? value.substring(1) : value;
  const [magnitude, decimal = ``] = wholeMagnitude.split(`.`);
  return {isNegative, magnitude, decimal};
}

function compare(a: SplitNumber, b: SplitNumber) {
  const decimalLength = Math.max(a.decimal.length, b.decimal.length);
  if (a.isNegative) {
    if (!b.isNegative) return A_IS_SMALLER;
    return (
      compareMagnitude(b.magnitude, a.magnitude) ||
      compareMagnitude(
        b.decimal.padEnd(decimalLength, `0`),
        a.decimal.padEnd(decimalLength, `0`),
      )
    );
  } else {
    if (b.isNegative) return B_IS_SMALLER;
    return (
      compareMagnitude(a.magnitude, b.magnitude) ||
      compareMagnitude(
        a.decimal.padEnd(decimalLength, `0`),
        b.decimal.padEnd(decimalLength, `0`),
      )
    );
  }
}

function compareMagnitude(a: string, b: string) {
  if (a.length < b.length) return A_IS_SMALLER;
  if (a.length > b.length) return B_IS_SMALLER;
  if (a < b) return A_IS_SMALLER;
  if (a > b) return B_IS_SMALLER;
  return EQUAL;
}
