import type {Codec} from 'funtypes';
import {String as S, Constraint, showValue} from 'funtypes';

export interface DateStringOptions {
  min?: string;
  max?: string;
}
export default function DateString({
  min = '0000-01-01',
  max = '9999-12-30',
}: DateStringOptions = {}): Codec<string> {
  if (!isValidDateString(min)) {
    throw new Error(
      `Expected min (${showValue(
        min,
      )}) to be a valid date string in the form "yyyy-mm-dd"`,
    );
  }
  if (!isValidDateString(max)) {
    throw new Error(
      `Expected max (${showValue(
        max,
      )}) to be a valid date string in the form "yyyy-mm-dd"`,
    );
  }
  if (min >= max) {
    throw new Error(
      `Expected min (${showValue(min)}) to be less than max (${showValue(
        max,
      )})`,
    );
  }
  return Constraint(
    S,
    (value) => {
      if (!isValidDateString(value) || value < min || value > max) {
        return `Expected a date in form "yyyy-mm-dd" between ${showValue(
          min,
        )} and ${showValue(max)} but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `DateString`, args: {min, max}},
  );
}

function isValidDateString(str: string) {
  if (!(typeof str === 'string' && /^\d\d\d\d-\d\d-\d\d$/.test(str))) {
    return false;
  }
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().split(`T`)[0] === str;
}
