import type {Codec} from 'funtypes';
import {ParsedValue} from 'funtypes';

import type {FloatOptions} from './Float';
import Float from './Float';
import FloatString from './FloatString';

export default function ParsedFloatString(
  options?: FloatOptions,
): Codec<number> {
  return ParsedValue(
    FloatString({
      min: options?.min?.toString(10),
      max: options?.max?.toString(10),
    }),
    {
      name: `Float`,
      test: Float(options),
      parse(value) {
        return {success: true, value: parseFloat(value)};
      },
      serialize(value) {
        return {success: true, value: value.toString(10)};
      },
    },
  );
}
