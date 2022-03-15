import type {Codec} from 'funtypes';
import {ParsedValue} from 'funtypes';

import DateTime from './DateTime';
import type {DateTimeStringOptions} from './DateTimeString';
import DateTimeString from './DateTimeString';

export default function ParsedDateTimeString(
  options: DateTimeStringOptions,
): Codec<Date> {
  return ParsedValue(DateTimeString(options), {
    name: `Date`,
    test: DateTime(options),
    parse(value) {
      return {success: true, value: new Date(value)};
    },
    serialize(value) {
      return {success: true, value: value.toISOString()};
    },
  });
}
