import type {Codec} from 'funtypes';
import {String as S, Constraint, showValue} from 'funtypes';

import type {DateTimeOptions} from './DateTime';
import {validateDateOptions} from './DateTime';

export interface DateTimeStringOptions extends DateTimeOptions {
  strict?: boolean;
}
export default function DateTimeString({
  min,
  max,
  strict = false,
}: DateTimeStringOptions = {}): Codec<string> {
  validateDateOptions({min, max});

  return Constraint(
    S,
    (value) => {
      if (
        strict &&
        !/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d\d\d)?Z$/.test(value)
      ) {
        return `${showValue(
          value,
        )} is not a valid date in the full ISO8601 format.`;
      }
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        return `${showValue(value)} is not a valid date`;
      }
      if (min && d.getTime() < min.getTime()) {
        return `Expected a date on or after ${min.toISOString()} but got ${showValue(
          value,
        )}`;
      }
      if (max && d.getTime() > max.getTime()) {
        return `Expected a date on or before ${max.toISOString()} but got ${showValue(
          value,
        )}`;
      }
      if (
        strict &&
        d.toISOString().replace(/(?:\.\d\d\d)?Z$/, ``) !==
          value.replace(/(?:\.\d\d\d)?Z$/, ``)
      ) {
        return `${showValue(
          value,
        )} is not a valid date in the full ISO8601 format.`;
      }
      return true;
    },
    {name: `DateTimeString`, args: {min, max}},
  );
}
