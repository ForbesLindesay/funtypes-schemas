import {Codec, Constraint, String as S, ParsedValue} from 'funtypes';

import Url, {UrlOptions} from './Url';

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
        } catch (ex: any) {
          return ex.message;
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
      } catch (ex: any) {
        return {
          success: false,
          message: ex.message,
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
