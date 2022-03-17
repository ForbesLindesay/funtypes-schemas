import type {Codec} from 'funtypes';
import {ParsedValue} from 'funtypes';

export default function Migrate<S, T>(
  source: Codec<S>,
  migration: (legacyValue: S) => T,
): Codec<T> {
  return ParsedValue(source, {
    parse(value) {
      try {
        return {success: true, value: migration(value)};
      } catch (ex: any) {
        return {
          success: false,
          message:
            typeof ex?.message === 'string' ? ex.message : `Migration failed`,
        };
      }
    },
  });
}
