import type {Codec} from 'funtypes';
import {String as S, ParsedValue} from 'funtypes';

import {stringToUnicode, unicodeToString} from '../utils/base64';
import ParsedBase64Array from './ParsedBase64Array';

export default function ParsedBase64String(): Codec<string> {
  return ParsedValue(ParsedBase64Array(), {
    name: `string`,
    test: S,
    parse(value) {
      return {
        success: true,
        value: unicodeToString(value),
      };
    },
    serialize(value) {
      return {
        success: true,
        value: stringToUnicode(value),
      };
    },
  });
}
