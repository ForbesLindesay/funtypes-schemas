# funtypes-schemas

Validators and parsers for common types not covered by the base [funtypes](https://github.com/ForbesLindesay/funtypes) package.

[![Build Status](https://img.shields.io/github/actions/workflow/status/ForbesLindesay/funtypes-schemas/test.yml?branch=main&style=for-the-badge)](https://github.com/ForbesLindesay/funtypes-schemas/actions?query=workflow%3ATest+branch%3Amain)
[![Coveralls github branch](https://img.shields.io/coveralls/github/ForbesLindesay/funtypes-schemas/main?color=brightgreen&style=for-the-badge)](https://coveralls.io/github/ForbesLindesay/funtypes-schemas)
[![Rolling Versions](https://img.shields.io/badge/Rolling%20Versions-Enabled-brightgreen?style=for-the-badge)](https://rollingversions.com/ForbesLindesay/funtypes-schemas)
[![NPM version](https://img.shields.io/npm/v/funtypes-schemas?style=for-the-badge)](https://www.npmjs.com/package/funtypes-schemas)

This package includes all these schemas:

- 🚀 Base64String
- 🚀 ChainCodecs
- 🚀 ConstrainLength
- 🚀 DateString
- 🚀 DateTime
- 🚀 DateTimeString
- 🚀 Float
- 🚀 FloatString
- 🚀 Integer
- 🚀 IntegerString
- 🚀 Migrate
- 🚀 ParsedBase64Array
- 🚀 ParsedBase64String
- 🚀 ParsedDateString
- 🚀 ParsedDateTimeString
- 🚀 ParsedFloatString
- 🚀 ParsedIntegerString
- 🚀 ParsedJsonString
- 🚀 ParsedUrlString
- 🚀 Url
- 🚀 UrlString

## Installation

```
yarn add funtypes-schemas
```

## Usage

### Base64String

Validate that a string could represent base64 encoded binary data.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({data: s.Base64String()});
```

✅ Valid:

```json
{"data": "abc=="}
```

🚨 Invalid:

```json
{"data": "!~~"}
```

### ParsedBase64String

Extends `Base64String` by transparently converting the string between a utf8 string and a base64 representation.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  data: s.ParsedBase64String(),
});

deepEqual(
  MySchema.parse({
    data: 'aGVsbG8gd29ybGQ=',
  }),
  {
    data: 'hello world',
  },
);

deepEqual(
  MySchema.serialize({
    data: 'hello world',
  }),
  {
    data: 'aGVsbG8gd29ybGQ=',
  },
);
```

### ParsedBase64Array

Extends `Base64String` by transparently converting the string between a Uint8Array and a base64 representation.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  data: s.ParsedBase64Array(),
});

deepEqual(
  MySchema.parse({
    data: 'aGVsbG8gd29ybGQ=',
  }),
  {
    data: new Uint8Array([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]),
  },
);

deepEqual(
  MySchema.serialize({
    data: new Uint8Array([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]),
  }),
  {
    data: 'aGVsbG8gd29ybGQ=',
  },
);
```

### ChainCodecs

Chain multiple codecs together to combine parsers, for example you can parse a Base64 encoded JSON object:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = s.ChainCodecs(
  s.ParsedBase64String(),
  s.ParsedJsonString(t.Object({value: s.Integer()})),
);

// ✅ Valid:
deepEqual(assertMySchema.parse('eyJ2YWx1ZSI6NDJ9'), {value: 42});

// ✅ Valid:
deepEqual(assertMySchema.serialize({value: 42}), 'eyJ2YWx1ZSI6NDJ9');
```

You can pass as many codecs as you like as parameters to `ChainCodecs`. They will be applied in order when parsing and in reverse order when serializing.

### ConstrainLength

Constrain the length of a base type that has a `length` property, such as a `String` or an `Array`.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  nonEmptyString: s.ConstrainLength(t.String, {min: 1})
  limitedList: s.ConstrainLength(t.Array(t.String), {max: 3}),
});
```

✅ Valid:

```json
{
  "nonEmptyString": "hello world",
  "limitedList": ["a", "b", "c"]
}
```

🚨 Invalid (string must have length >= 1):

```json
{
  "nonEmptyString": "",
  "limitedList": ["a", "b", "c"]
}
```

🚨 Invalid (array must have length <= 3):

```json
{
  "nonEmptyString": "hello world",
  "limitedList": ["a", "b", "c", "d"]
}
```

### DateString

Represent a date (not including a time) in `yyyy-mm-dd` format.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  dateOfBirth: s.DateString({max: `2022-03-15`}),
});
```

✅ Valid:

```json
{
  "dateOfBirth": "1930-01-15"
}
```

🚨 Invalid (date is greater than max date):

```json
{
  "dateOfBirth": "2034-01-15"
}
```

🚨 Invalid (date includes a time):

```json
{
  "dateOfBirth": "2034-01-15T11:30:00Z"
}
```

🚨 Invalid (date is not valid):

```json
{
  "dateOfBirth": "hello world"
}
```

### ParsedDateString

Equivalent to the `DateString` schema, except that once you have parsed the value, it is represented as a JavaScript `Date` object.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.ParsedDateString(),
});

deepEqual(
  MySchema.parse({
    timestamp: '2022-03-16',
  }),
  {
    timestamp: new Date('2022-03-16T00:00:00.000Z'),
  },
);

deepEqual(
  MySchema.serialize({
    timestamp: new Date('2022-03-16T00:00:00.000Z'),
  }),
  {
    timestamp: '2022-03-16',
  },
);
```

🚨 Invalid:

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.ParsedDateString(),
});

// The next line throws an error because there is a time
// component:
MySchema.serialize({
  timestamp: new Date('2022-03-16T13:45:00.000Z'),
});
```

### DateTime

Represent a date time as a JavaScript `Date` object.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.DateTime({min: new Date(`2022-03-15`)}),
});
```

✅ Valid:

```js
const obj = {
  timestamp: new Date(`2022-03-16T12:03:00Z`),
};
```

🚨 Invalid (date is less than min date):

```js
const obj = {
  timestamp: new Date(`2022-03-01T12:03:00Z`),
};
```

🚨 Invalid (date must be valid):

```js
const obj = {
  timestamp: new Date(`2022-03-36`),
};
```

🚨 Invalid (date cannot be represented as a string):

```js
const obj = {
  timestamp: `2022-03-16T12:03:00Z`,
};
```

### DateTimeString

Represent a date time as a `string`.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.DateTimeString({min: new Date(`2022-03-15`), strict: true}),
});
```

✅ Valid:

```json
{
  "timestamp": "2022-03-16T12:03:00Z"
}
```

✅ Valid with `strict: false`, but 🚨 invalid with `strict: true` (time zone, i.e. `Z`, is required):

```json
{
  "timestamp": "2022-03-16T12:03:00"
}
```

✅ Valid with `strict: false` (equivalent to setting time to `00:00:00.000Z`), but 🚨 invalid with `strict: true` (time is required):

```json
{
  "timestamp": "2022-03-16"
}
```

✅ Valid with `strict: false` (JavaScript treats this as `2022-03-02T12:03:00.000Z`), but 🚨 invalid with `strict: true` (30th February is not a real date):

```json
{
  "timestamp": "2022-02-30T12:03:00Z"
}
```

🚨 Invalid (date is less than min date):

```json
{
  "timestamp": "2022-03-01T12:03:00Z"
}
```

🚨 Invalid (date must be valid):

```json
{
  "timestamp": "2022-03-36"
}
```

### ParsedDateTimeString

Equivalent to the `DateTimeString` schema, except that once you have parsed the value, it is represented as a JavaScript `Date` object.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.ParsedDateTimeString({
    min: new Date(`2022-03-15`),
    strict: true,
  }),
});

deepEqual(
  MySchema.parse({
    timestamp: '2022-03-16T12:03:00Z',
  }),
  {
    timestamp: new Date('2022-03-16T12:03:00Z'),
  },
);

deepEqual(
  MySchema.serialize({
    timestamp: new Date('2022-03-16T12:03:00Z'),
  }),
  {
    timestamp: '2022-03-16T12:03:00.000Z',
  },
);
```

🚨 Invalid:

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  timestamp: s.ParsedDateTimeString(),
});

// The next line throws an error because the
// timestamp does not represent a valid Date:
MySchema.serialize({
  timestamp: new Date('hello world'),
});
```

### Float

Validate that a number is not NaN and optionally is within the desired range:

- `min` defaults to `undefined` (i.e. no minimum value).
- `max` defaults to `undefined` (i.e. no maximum value).

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  weight: s.Float({min: 0, max: 1}),
});
```

✅ Valid:

```json
{"weight": 1}
```

✅ Valid:

```json
{"weight": 0.3456}
```

🚨 Invalid (value is greater than "max"):

```json
{"weight": 15}
```

🚨 Invalid (value is not a `number`):

```json
{"weight": "1"}
```

### FloatString

Validate that a string represents a floating point number (optionally in the desired range). Using a string can be helpful as it allows you to get precision that may be lost in JavaScript number representations.

- `min` defaults to `undefined` (i.e. no minimum value).
- `max` defaults to `undefined` (i.e. no maximum value).

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  weight: s.FloatString({min: `0`, max: `1`}),
});
```

✅ Valid:

```json
{"weight": "1"}
```

✅ Valid:

```json
{"weight": "0.3456"}
```

🚨 Invalid (value does not represent a floating point number):

```json
{"weight": "hello world"}
```

🚨 Invalid (value is greater than "max"):

```json
{"weight": "15"}
```

🚨 Invalid (value is not a `string`):

```json
{"weight": 1}
```

### ParsedFloatString

Equivalent to the `FloatString` schema, except that once you have parsed the value, it is represented as a JavaScript `number`. This may result in a loss of precision.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  weight: s.ParsedFloatString({min: 0, max: 1}),
});

deepEqual(
  MySchema.parse({
    level: '0.5',
  }),
  {
    level: 0.5,
  },
);

deepEqual(
  MySchema.serialize({
    level: 0.5,
  }),
  {
    level: '0.5',
  },
);
```

🚨 Invalid:

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  level: s.ParsedIntegerString({min: 1, max: 6}),
});

// The next line throws an error because the value is outside the requested range:
MySchema.serialize({
  level: 42,
});
```

### Integer

Validate that a number is an integer (optionally within the desired range)

- `min` defaults to `Number.MIN_SAFE_INTEGER` (i.e. `-9007199254740991`). It can be set to a higher value, but cannot be set to a lower value.
- `max` defaults to `Number.MAX_SAFE_INTEGER` (i.e. `9007199254740991`). It can be set to a lower value, but cannot be set to a higher value.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  level: s.Integer({min: 1, max: 6}),
});
```

✅ Valid:

```json
{"level": 1}
```

🚨 Invalid (value is not an integer):

```json
{"level": 1.5}
```

🚨 Invalid (value is greater than "max"):

```json
{"level": 15}
```

🚨 Invalid (value is not a `number`):

```json
{"level": "1"}
```

### IntegerString

Validate that a string contains an integer, (optionally within the desired range)

- `min` defaults to `Number.MIN_SAFE_INTEGER` (i.e. `'-9007199254740991'`). It can be set to any integer, even if that integer cannot be represented as a `number` in JavaScript.
- `max` defaults to `Number.MAX_SAFE_INTEGER` (i.e. `'9007199254740991'`). It can be set to any integer, even if that integer cannot be represented as a `number` in JavaScript.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  id: s.Integer({
    min: `-9999999999999999999999999`,
    max: `9999999999999999999999999`,
  }),
});
```

✅ Valid:

```json
{"id": "99"}
```

✅ Valid (integer strings can be used to represent numbers that are larger than `Number.MAX_SAFE_INTEGER`):

```json
{"id": "9999999999999999999999978"}
```

🚨 Invalid (value is not an integer):

```json
{"level": "1.5"}
```

🚨 Invalid (value is not a string):

```json
{"level": 15}
```

🚨 Invalid (value is greater than "max"):

```json
{"level": "9999999999999999999999999999999999999"}
```

### ParsedIntegerString

Equivalent to the `IntegerString` schema, except that once you have parsed the value, it is represented as a JavaScript `number`. This restricts your integers to between `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  level: s.ParsedIntegerString({min: 1, max: 6}),
});

deepEqual(
  MySchema.parse({
    level: '3',
  }),
  {
    level: 3,
  },
);

deepEqual(
  MySchema.serialize({
    level: 3,
  }),
  {
    level: '3',
  },
);
```

🚨 Invalid:

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  level: s.ParsedIntegerString({min: 1, max: 6}),
});

// The next line throws an error because the value is not an integer:
MySchema.serialize({
  level: 3.14,
});
```

### ParsedJsonString

Transparently parse/serialize to/from JSON. A codec can optionally be provided to handle the parsed value.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = s.ParsedJsonString(
  t.Object({
    level: s.ParsedIntegerString(),
  }),
);

deepEqual(MySchema.parse(`{"level": "3"}`), {
  level: 3,
});

deepEqual(
  MySchema.serialize({
    level: 3,
  }),
  `{"level":"3"}`,
);
```

🚨 Invalid:

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = s.ParsedJsonString(
  t.Object({
    level: s.ParsedIntegerString(),
  }),
);

// The next line throws an error because the string is not valid JSON:
MySchema.parse(`{level: '3'}`);

// The next line throws an error because the value is not an integer:
MySchema.parse(`{"level": "3.14"}`);

// The next line throws an error because the value is not an integer:
MySchema.serialize({
  level: 3.14,
});
```

### Migrate

A simplified alternative to `ParsedValue`/`.withParser` for migrating legacy data. The `Migrate` cannot be serialized, so it's best used in a `Union` where one of the other types in the union handles serialization.

🚀 Migrating an object to a new schema:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Union(
  t.Object({
    version: t.Literal(2),
    width: t.Number,
    height: t.Number,
  }),
  s.Migrate(
    t.Object({
      version: t.Literal(1),
      size: t.Number,
    }),
    ({size}) => ({
      version: 2,
      width: size,
      height: size,
    }),
  ),
);

// ✅ Valid:
deepEqual(
  MySchema.parse({
    version: 2,
    width: 10,
    height: 15,
  }),
  {
    version: 2,
    width: 10,
    height: 15,
  },
);

// ✅ Valid:
deepEqual(
  MySchema.parse({
    version: 1,
    size: 42,
  }),
  {
    version: 2,
    width: 42,
    height: 42,
  },
);

// ✅ Valid:
deepEqual(
  MySchema.serialize({
    version: 2,
    width: 10,
    height: 15,
  }),
  {
    version: 2,
    width: 10,
    height: 15,
  },
);
```

🚀 Setting a default for an optional property:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  values: t.Union(
    t.Array(t.Number),
    s.Migrate(t.Undefined, () => []),
  ),
});

// ✅ Valid:
deepEqual(MySchema.parse({values: [1, 2, 3]}), {values: [1, 2, 3]});

// ✅ Valid:
deepEqual(MySchema.parse({values: []}), {values: []});

// ✅ Valid:
deepEqual(MySchema.parse({values: undefined}), {values: []});

// ✅ Valid:
deepEqual(MySchema.parse({}), {values: []});

// ✅ Valid:
deepEqual(MySchema.serialize({values: [1, 2, 3]}), {values: [1, 2, 3]});

// ✅ Valid:
deepEqual(MySchema.serialize({values: []}), {values: []});

// 🚨 Invalid:
deepEqual(MySchema.serialize({values: undefined}), {values: []});

// 🚨 Invalid:
deepEqual(MySchema.serialize({}), {values: []});
```

### Url

Represent an absolute URL as a JavaScript `URL` object. You can pass options to constrain the valid URLs:

- `allowedProtocols` - Set of valid protocols, e.g. `new Set(['http:', 'https:'])`. Defaults to allowing any protocol.
- `allowedHosts` - Set of valid hosts, e.g. `new Set(['example.com'])`. Defaults to allowing any host.
- `allowedOrigins` - Set of allowed origins, e.g. `new Set('https://example.com')`. Defaults to allowing any origin.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  href: s.Url({allowedProtocols: new Set([`http:`, `https:`])}),
});
```

✅ Valid:

```js
const obj = {
  href: new URL(`http://example.com`),
};
```

🚨 Invalid (protocol does not match teh allowed protocols):

```js
const obj = {
  href: new URL(`tel:0000000000`),
};
```

🚨 Invalid (value is not a URL):

```js
const obj = {
  href: `http://example.com`,
};
```

### UrlString

Represent an absolute URL as a `string`. You can pass options to constrain the valid URLs:

- `allowedProtocols` - Set of valid protocols, e.g. `new Set(['http:', 'https:'])`. Defaults to allowing any protocol.
- `allowedHosts` - Set of valid hosts, e.g. `new Set(['example.com'])`. Defaults to allowing any host.
- `allowedOrigins` - Set of allowed origins, e.g. `new Set('https://example.com')`. Defaults to allowing any origin.

```ts
import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  href: s.UrlString({allowedProtocols: new Set([`http:`, `https:`])}),
});
```

✅ Valid (will be normalized to add a trailing `/` when parsing):

```json
{"href": "http://example.com"}
```

✅ Valid:

```json
{"href": "http://example.com/foo/bar"}
```

🚨 Invalid (protocol does not match teh allowed protocols):

```json
{"href": "tel:0000000000"}
```

🚨 Invalid (value is not a string):

```js
const obj = {
  href: new URL(`http://example.com`),
};
```

### ParsedUrlString

Equivalent to the `UrlString` schema, except that once you have parsed the value, it is represented as a JavaScript `URL` object.

✅ Valid:

```ts
import {deepEqual} from 'assert';

import * as t from 'funtypes';
import * as s from 'funtypes-schemas';

const MySchema = t.Object({
  href: s.ParsedUrlString(),
});

deepEqual(
  MySchema.parse({
    href: 'https://example.com/foo/bar',
  }),
  {
    href: new URL('https://example.com/foo/bar'),
  },
);

deepEqual(
  MySchema.serialize({
    href: new URL('https://example.com/foo/bar'),
  }),
  {
    href: 'https://example.com/foo/bar',
  },
);
```
