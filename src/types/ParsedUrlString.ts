import {Codec, String as S, ParsedValue} from 'funtypes';

import Url, {UrlOptions} from './Url';

export default function ParsedUrlString(options?: UrlOptions): Codec<URL> {
  const u = Url(options);
  return ParsedValue(S, {
    name: `URL`,
    test: u,
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
      return u.safeParse(url);
    },
    serialize(value) {
      return {success: true, value: value.href};
    },
  });
}
