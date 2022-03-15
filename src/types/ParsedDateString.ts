import {Codec, Constraint, InstanceOf} from 'funtypes';
import {ParsedValue} from 'funtypes';

import type {DateStringOptions} from './DateString';
import DateString from './DateString';

export default function ParsedDateTimeString(
  options?: DateStringOptions,
): Codec<Date> {
  const base = DateString(options);
  return ParsedValue(base, {
    name: `Date`,
    test: Constraint(InstanceOf(Date), (value) => {
      if (!/^\d\d\d\d-\d\d-\d\dT00:00:00.000Z$/.test(value.toISOString())) {
        return `Expected a Date with no time portion but got ${value.toISOString()}`;
      }
      const result = base.safeParse(value.toISOString().split(`T`)[0]);
      if (!result.success) return result.message;
      return true;
    }),
    parse(value) {
      return {success: true, value: new Date(value)};
    },
    serialize(value) {
      return {success: true, value: value.toISOString().split(`T`)[0]};
    },
  });
}
