import type {Codec} from 'funtypes';
import {Constraint, String as S, ParsedValue} from 'funtypes';

import type {UrlOptions} from './Url';
import Url from './Url';

export default function UrlString(options?: UrlOptions): Codec<string> {
  const u = Url(options);
  return ParsedValue(S, {
    name: `UrlString`,
    test: Constraint(
      S,
      (value) => {
        let url;
        try {
          url = new URL(value);
        } catch (_ex) {
          return `Invalid URL: ${value}`;
        }
        const result = u.safeParse(url);
        if (!result.success) return result.message;
        return true;
      },
      {name: `URL`},
    ),
    parse(value) {
      let url;
      try {
        url = new URL(value);
      } catch (_ex) {
        return {
          success: false,
          message: `Invalid URL: ${value}`,
        };
      }
      const result = u.safeParse(url);
      if (!result.success) return result;
      return {success: true, value: result.value.href};
    },
    serialize(value) {
      return {success: true, value: new URL(value).href};
    },
  });
}
