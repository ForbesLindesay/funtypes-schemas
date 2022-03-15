import type {Codec} from 'funtypes';
import {String as S, Constraint, showValue} from 'funtypes';

export default function Base64String(): Codec<string> {
  return Constraint(
    S,
    (value) => {
      if (!/^[0-9a-zA-Z/+,_-]*=*$/.test(value)) {
        return `Expected a base64 encoded string but got ${showValue(value)}`;
      }
      return true;
    },
    {name: `Base64String`},
  );
}
