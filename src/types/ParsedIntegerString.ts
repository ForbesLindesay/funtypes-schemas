import type {Codec} from 'funtypes';
import {ParsedValue} from 'funtypes';

import type {IntegerOptions} from './Integer';
import Integer from './Integer';
import IntegerString from './IntegerString';

export default function ParsedIntegerString({
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
}: IntegerOptions = {}): Codec<number> {
  return ParsedValue(
    IntegerString({
      min: min.toString(10),
      max: max.toString(10),
    }),
    {
      name: `Integer`,
      test: Integer({min, max}),
      parse(value) {
        return {success: true, value: parseInt(value, 10)};
      },
      serialize(value) {
        return {success: true, value: value.toString(10)};
      },
    },
  );
}
