import type {Codec} from 'funtypes';
import {InstanceOf, ParsedValue} from 'funtypes';

import {base64Decode, base64Encode} from '../utils/base64';
import Base64String from './Base64String';

export default function ParsedBase64Array(): Codec<Uint8Array> {
  return ParsedValue(Base64String(), {
    name: `Unit8Array`,
    test: InstanceOf(Uint8Array),
    parse(value) {
      return {success: true, value: base64Decode(value)};
    },
    serialize(value) {
      return {success: true, value: base64Encode(value)};
    },
  });
}
