import type {Codec} from 'funtypes';
import {InstanceOf, Constraint, showValue} from 'funtypes';

export interface UrlOptions {
  allowedProtocols?: ReadonlySet<string>;
  allowedHosts?: ReadonlySet<string>;
  allowedOrigins?: ReadonlySet<string>;
}
export default function Url(options: UrlOptions = {}): Codec<URL> {
  if (options.allowedProtocols) {
    for (const protocol of options.allowedProtocols) {
      if (!protocol.endsWith(`:`)) {
        throw new Error(
          `Invalid protocol, "${protocol}". Did you mean: "${protocol}:"?`,
        );
      }
    }
  }
  return Constraint(
    InstanceOf(URL),
    (value) => {
      return (
        getErrorFor(value, 'protocol', options.allowedProtocols) ??
        getErrorFor(value, 'host', options.allowedHosts) ??
        getErrorFor(value, 'origin', options.allowedOrigins) ??
        true
      );
    },
    {name: `URL`, args: options},
  );
}

function getErrorFor(
  value: URL,
  name: 'protocol' | 'origin' | 'host',
  set: ReadonlySet<string> | undefined,
) {
  if (set && !set.has(value[name])) {
    return `Invalid ${name} ${showValue(value[name])}, expected one of: ${[
      ...set,
    ]
      .map((v) => showValue(v))
      .join(`, `)} for URL ${showValue(value.href)}`;
  }
  return undefined;
}
