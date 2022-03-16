import {Codec, showType} from 'funtypes';
import {ParsedValue} from 'funtypes';

export default function ChainCodecs<T>(
  ...codecs: [...Codec<any>[], Codec<T>]
): Codec<T> {
  return ChainCodecsInternal(
    codecs.slice(),
    codecs.map((c) => showType(c)),
  );
}
function ChainCodecsInternal(
  codecs: Codec<any>[],
  names: string[],
): Codec<any> {
  const end = codecs.pop()!;
  if (!codecs.length) return end;

  const name = `Chain<${names.join(`, `)}>`;
  names.pop();

  const start = ChainCodecsInternal(codecs, names);
  return ParsedValue(start, {
    name,
    test: end,
    parse(value) {
      return end.safeParse(value);
    },
    serialize(value) {
      return end.safeSerialize(value);
    },
  });
}
