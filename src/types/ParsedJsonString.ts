import {Codec, showType, Unknown} from 'funtypes';
import {String as S, ParsedValue} from 'funtypes';

export default function ParsedJsonString(): Codec<unknown>;
export default function ParsedJsonString<T>(base: Codec<T>): Codec<T>;
export default function ParsedJsonString<T>(base?: Codec<T>): Codec<T> {
  if (!base) {
    return ParsedJsonString<T>(Unknown as Codec<T>);
  }
  return ParsedValue(S, {
    name: `ParsedJsonString<${showType(base)}>`,
    test: base,
    parse(value) {
      let v: unknown;
      try {
        v = JSON.parse(value);
      } catch (ex: any) {
        return {success: false, message: `Invalid JSON: ${ex.message}`};
      }
      return base.safeParse(v);
    },
    serialize(value) {
      // At this point the "test" has already passed, so it should be safe to call "base.serialize"
      const result = base.serialize(value);
      return {success: true, value: JSON.stringify(result)};
    },
  });
}
