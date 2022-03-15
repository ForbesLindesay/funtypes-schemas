import type {Codec} from 'funtypes';
import {String as S, Constraint, showValue} from 'funtypes';

const A_IS_SMALLER = -1;
const B_IS_SMALLER = 1;
const EQUAL = 0;

interface SplitNumber {
  isNegative: boolean;
  magnitude: string;
}
export interface IntegerStringOptions {
  min?: string;
  max?: string;
}
export default function IntegerString({
  min = Number.MIN_SAFE_INTEGER.toString(10),
  max = Number.MAX_SAFE_INTEGER.toString(10),
}: IntegerStringOptions = {}): Codec<string> {
  const sMin = splitNumber(min);
  const sMax = splitNumber(max);
  if (compare(sMin, sMax) !== A_IS_SMALLER) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  return Constraint(
    S,
    (value) => {
      if (!isValid(value)) {
        return `Expected an integer string between ${showValue(
          min,
        )} and ${showValue(max)} but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `IntegerString`, args: {min, max}},
  );

  function isValid(value: string): boolean {
    if (!/^(0|\-?[1-9]\d*)$/.test(value)) {
      return false;
    }
    const sValue = splitNumber(value);
    return (
      compare(sMin, sValue) !== B_IS_SMALLER &&
      compare(sValue, sMax) !== B_IS_SMALLER
    );
  }
}

function splitNumber(value: string): SplitNumber {
  const isNegative = value.startsWith(`-`);
  return {isNegative, magnitude: isNegative ? value.substring(1) : value};
}

function compare(a: SplitNumber, b: SplitNumber) {
  if (a.isNegative) {
    if (!b.isNegative) return A_IS_SMALLER;
    return compareMagnitude(b.magnitude, a.magnitude);
  } else {
    if (b.isNegative) return B_IS_SMALLER;
    return compareMagnitude(a.magnitude, b.magnitude);
  }
}

function compareMagnitude(a: string, b: string) {
  if (a.length < b.length) return A_IS_SMALLER;
  if (a.length > b.length) return B_IS_SMALLER;
  if (a < b) return A_IS_SMALLER;
  if (a > b) return B_IS_SMALLER;
  return EQUAL;
}
