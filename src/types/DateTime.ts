import type {Codec} from 'funtypes';
import {InstanceOf, Constraint} from 'funtypes';

// Dates outside the valid range return NaN for .getTime()
// so we don't need to encode these defaults
// const MIN_SAFE_DATE = new Date(-8640000000000000);
// const MAX_SAFE_DATE = new Date(8640000000000000);
export interface DateTimeOptions {
  min?: Date;
  max?: Date;
}
export function validateDateOptions({min, max}: DateTimeOptions) {
  if (min && !(min instanceof Date && !Number.isNaN(min.getTime()))) {
    throw new Error(`min is not a valid date.`);
  }
  if (max && !(max instanceof Date && !Number.isNaN(max.getTime()))) {
    throw new Error(`max is not a valid date.`);
  }
  if (min && max && min.getTime() >= max.getTime()) {
    throw new Error(
      `Expected min (${min.toISOString()}) to be less than max (${max.toISOString()})`,
    );
  }
}
export default function DateTime({
  min,
  max,
}: DateTimeOptions = {}): Codec<Date> {
  validateDateOptions({min, max});

  return Constraint(
    InstanceOf(Date),
    (value) => {
      if (Number.isNaN(value.getTime())) {
        return `[INVALID DATE] is not a valid date`;
      }
      if (min && value.getTime() < min.getTime()) {
        return `Expected a date on or after ${min.toISOString()} but got ${value.toISOString()}`;
      }
      if (max && value.getTime() > max.getTime()) {
        return `Expected a date on or before ${max.toISOString()} but got ${value.toISOString()}`;
      }
      return true;
    },
    {name: `Date`, args: {min, max}},
  );
}
