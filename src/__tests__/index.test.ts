import * as t from 'funtypes';

import * as s from '..';

function expectOk(value: t.Result<unknown>) {
  if (value.success) {
    return expect(value.value);
  } else {
    expect(value).toEqual({success: true});
    throw new Error(`Unreachable code`);
  }
}
function expectFail(value: t.Result<unknown>) {
  if (!value.success) {
    return expect(value.message);
  } else {
    expect(value).toEqual({success: false});
    throw new Error(`Unreachable code`);
  }
}

test(`Base64String`, () => {
  expectOk(s.Base64String().safeParse(`abc==`)).toMatchInlineSnapshot(
    `"abc=="`,
  );
  expectFail(s.Base64String().safeParse(`!~~`)).toMatchInlineSnapshot(
    `"Expected a base64 encoded string but got \\"!~~\\""`,
  );
});

test(`ConstrainLength`, () => {
  expect(() =>
    s.ConstrainLength(t.String, {min: -1, max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (-1) to be greater than or equal to 0"`,
  );
  expect(() =>
    s.ConstrainLength(t.String, {min: 0, max: Math.pow(2, 64)}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected max (18446744073709552000) to be less than or equal to Number.MAX_SAFE_INTEGER (9007199254740991)"`,
  );
  expect(() =>
    s.ConstrainLength(t.String, {min: 10, max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (10) to be less than max (3)"`,
  );

  expect(s.ConstrainLength(t.String).safeParse(`abc`)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "abc",
    }
  `);
  expect(s.ConstrainLength(t.String, {min: 1, max: 3}).safeParse(`abc`))
    .toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "abc",
    }
  `);
  expect(s.ConstrainLength(t.String, {min: 1, max: 3}).safeParse(`abcde`))
    .toMatchInlineSnapshot(`
    Object {
      "fullError": Array [
        "Unable to assign \\"abcde\\" to WithConstraint<string>",
        Array [
          "Expected length to be between 1 and 3, but length was 5",
        ],
      ],
      "message": "Expected length to be between 1 and 3, but length was 5",
      "success": false,
    }
  `);
  expect(s.ConstrainLength(t.String, {min: 1, max: 3}).safeParse(``))
    .toMatchInlineSnapshot(`
    Object {
      "fullError": Array [
        "Unable to assign \\"\\" to WithConstraint<string>",
        Array [
          "Expected length to be between 1 and 3, but length was 0",
        ],
      ],
      "message": "Expected length to be between 1 and 3, but length was 0",
      "success": false,
    }
  `);
});

test(`DateString`, () => {
  expect(() =>
    s.DateString({min: 'hello world'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"hello world\\") to be a valid date string in the form \\"yyyy-mm-dd\\""`,
  );
  expect(() =>
    s.DateString({max: 'hello world'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected max (\\"hello world\\") to be a valid date string in the form \\"yyyy-mm-dd\\""`,
  );
  expect(() =>
    s.DateString({min: '2022-02-04', max: '2022-02-01'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"2022-02-04\\") to be less than max (\\"2022-02-01\\")"`,
  );

  expectOk(s.DateString().safeParse(`2022-03-15`)).toMatchInlineSnapshot(
    `"2022-03-15"`,
  );
  expectFail(s.DateString().safeParse(`2022-02-30`)).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"2022-02-30\\""`,
  );
  expectFail(s.DateString().safeParse(`2022-02-35`)).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"2022-02-35\\""`,
  );
  expectFail(s.DateString().safeParse(`hello world`)).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"hello world\\""`,
  );

  expectOk(
    s
      .DateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-15`),
  ).toMatchInlineSnapshot(`"2022-03-15"`);
  expectOk(
    s
      .DateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-10`),
  ).toMatchInlineSnapshot(`"2022-03-10"`);
  expectFail(
    s
      .DateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-09`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"2022-03-10\\" and \\"2022-03-20\\" but got \\"2022-03-09\\""`,
  );
  expectOk(
    s
      .DateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-20`),
  ).toMatchInlineSnapshot(`"2022-03-20"`);
  expectFail(
    s
      .DateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-21`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"2022-03-10\\" and \\"2022-03-20\\" but got \\"2022-03-21\\""`,
  );
});

test(`DateTime`, () => {
  expect(() =>
    s.DateTime({min: new Date('hello world')}),
  ).toThrowErrorMatchingInlineSnapshot(`"min is not a valid date."`);
  expect(() =>
    s.DateTime({max: new Date('hello world')}),
  ).toThrowErrorMatchingInlineSnapshot(`"max is not a valid date."`);
  expect(() =>
    s.DateTime({min: new Date('2022-02-04'), max: new Date('2022-02-01')}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (2022-02-04T00:00:00.000Z) to be less than max (2022-02-01T00:00:00.000Z)"`,
  );

  expectOk(
    s.DateTime().safeParse(new Date(`2022-03-15T11:00:00Z`)),
  ).toMatchInlineSnapshot(`2022-03-15T11:00:00.000Z`);
  expectFail(s.DateTime().safeParse(`hello world`)).toMatchInlineSnapshot(
    `"Expected Date, but was \\"hello world\\""`,
  );
  expectFail(
    s.DateTime().safeParse(new Date(`hello world`)),
  ).toMatchInlineSnapshot(`"[INVALID DATE] is not a valid date"`);

  expectOk(
    s
      .DateTime({min: new Date(`2022-03-10`), max: new Date(`2022-03-20`)})
      .safeParse(new Date(`2022-03-15`)),
  ).toMatchInlineSnapshot(`2022-03-15T00:00:00.000Z`);
  expectFail(
    s
      .DateTime({min: new Date(`2022-03-10`), max: new Date(`2022-03-20`)})
      .safeParse(new Date(`2022-03-09`)),
  ).toMatchInlineSnapshot(
    `"Expected a date on or after 2022-03-10T00:00:00.000Z but got 2022-03-09T00:00:00.000Z"`,
  );
  expectFail(
    s
      .DateTime({min: new Date(`2022-03-10`), max: new Date(`2022-03-20`)})
      .safeParse(new Date(`2022-03-21`)),
  ).toMatchInlineSnapshot(
    `"Expected a date on or before 2022-03-20T00:00:00.000Z but got 2022-03-21T00:00:00.000Z"`,
  );
});

test(`DateTimeString`, () => {
  expectOk(
    s.DateTimeString({strict: false}).safeParse(`2022-03-15T11:00:00Z`),
  ).toMatchInlineSnapshot(`"2022-03-15T11:00:00Z"`);
  expectFail(
    s.DateTimeString({strict: false}).safeParse(`hello world`),
  ).toMatchInlineSnapshot(`"\\"hello world\\" is not a valid date"`);
  expectFail(
    s.DateTimeString({strict: false}).safeParse(`2022-03-38T00:00:00Z`),
  ).toMatchInlineSnapshot(`"\\"2022-03-38T00:00:00Z\\" is not a valid date"`);

  expectOk(
    s.DateTimeString({strict: false}).safeParse(`2022-02-31T00:00:00Z`),
  ).toMatchInlineSnapshot(`"2022-02-31T00:00:00Z"`);
  expectFail(
    s.DateTimeString({strict: true}).safeParse(`2022-02-31T00:00:00Z`),
  ).toMatchInlineSnapshot(
    `"\\"2022-02-31T00:00:00Z\\" is not a valid date in the full ISO8601 format."`,
  );
  expectOk(
    s.DateTimeString({strict: true}).safeParse(`2022-02-28T00:00:00Z`),
  ).toMatchInlineSnapshot(`"2022-02-28T00:00:00Z"`);
  expectOk(
    s.DateTimeString({strict: false}).safeParse(`1 March 2022`),
  ).toMatchInlineSnapshot(`"1 March 2022"`);
  expectFail(
    s.DateTimeString({strict: true}).safeParse(`1 March 2022`),
  ).toMatchInlineSnapshot(
    `"\\"1 March 2022\\" is not a valid date in the full ISO8601 format."`,
  );

  expectOk(
    s
      .DateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-15`),
  ).toMatchInlineSnapshot(`"2022-03-15"`);
  expectFail(
    s
      .DateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-09`),
  ).toMatchInlineSnapshot(
    `"Expected a date on or after 2022-03-10T00:00:00.000Z but got \\"2022-03-09\\""`,
  );
  expectFail(
    s
      .DateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-21`),
  ).toMatchInlineSnapshot(
    `"Expected a date on or before 2022-03-20T00:00:00.000Z but got \\"2022-03-21\\""`,
  );
});

test(`Float`, () => {
  expect(() =>
    s.Float({min: 10 + (undefined as any), max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(`"Expected min (NaN) to be a number"`);
  expect(() =>
    s.Float({min: 0, max: 10 + (undefined as any)}),
  ).toThrowErrorMatchingInlineSnapshot(`"Expected max (NaN) to be a number"`);
  expect(() => s.Float({min: 10, max: 3})).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (10) to be less than max (3)"`,
  );

  expectOk(s.Float().safeParse(100)).toMatchInlineSnapshot(`100`);
  expectOk(s.Float().safeParse(0)).toMatchInlineSnapshot(`0`);
  expectOk(s.Float().safeParse(-1)).toMatchInlineSnapshot(`-1`);
  expectOk(s.Float().safeParse(1.5)).toMatchInlineSnapshot(`1.5`);
  expectOk(s.Float().safeParse(Math.pow(2, 56))).toMatchInlineSnapshot(
    `72057594037927940`,
  );
  expectOk(s.Float().safeParse(Math.pow(2, 56) * -1)).toMatchInlineSnapshot(
    `-72057594037927940`,
  );

  expectFail(
    s.Float().safeParse(100 + (undefined as any)),
  ).toMatchInlineSnapshot(`"NaN is not a valid number"`);

  expectOk(s.Float({min: -20, max: 30}).safeParse(25)).toMatchInlineSnapshot(
    `25`,
  );
  expectOk(s.Float({min: -20, max: 30}).safeParse(0)).toMatchInlineSnapshot(
    `0`,
  );
  expectOk(s.Float({min: -20, max: 30}).safeParse(-15)).toMatchInlineSnapshot(
    `-15`,
  );
  expectFail(s.Float({min: -20, max: 30}).safeParse(35)).toMatchInlineSnapshot(
    `"Expected value to be less than or equal to 30 but got 35"`,
  );
  expectFail(s.Float({min: -20, max: 30}).safeParse(-25)).toMatchInlineSnapshot(
    `"Expected value to be greater than or equal to -20 but got -25"`,
  );

  expectOk(s.Float({min: -20, max: -15}).safeParse(-20)).toMatchInlineSnapshot(
    `-20`,
  );
  expectOk(s.Float({min: -20, max: -15}).safeParse(-17)).toMatchInlineSnapshot(
    `-17`,
  );
  expectOk(s.Float({min: -20, max: -15}).safeParse(-15)).toMatchInlineSnapshot(
    `-15`,
  );
  expectFail(s.Float({min: -20, max: -15}).safeParse(17)).toMatchInlineSnapshot(
    `"Expected value to be less than or equal to -15 but got 17"`,
  );
  expectFail(
    s.Float({min: -20, max: -15}).safeParse(-25),
  ).toMatchInlineSnapshot(
    `"Expected value to be greater than or equal to -20 but got -25"`,
  );
  expectFail(s.Float({min: -20, max: -15}).safeParse(-5)).toMatchInlineSnapshot(
    `"Expected value to be less than or equal to -15 but got -5"`,
  );
});

test(`FloatString`, () => {
  expect(() =>
    s.FloatString({min: `10`, max: `3`}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"10\\") to be less than max (\\"3\\")"`,
  );

  expectOk(s.FloatString().safeParse(`100`)).toMatchInlineSnapshot(`"100"`);
  expectOk(s.FloatString().safeParse(`0`)).toMatchInlineSnapshot(`"0"`);
  expectOk(s.FloatString().safeParse(`-1`)).toMatchInlineSnapshot(`"-1"`);
  expectOk(s.FloatString().safeParse(`1.5`)).toMatchInlineSnapshot(`"1.5"`);
  expectOk(
    s.FloatString().safeParse(Math.pow(2, 56).toString(10)),
  ).toMatchInlineSnapshot(`"72057594037927940"`);
  expectOk(
    s.FloatString().safeParse((Math.pow(2, 56) * -1).toString(10)),
  ).toMatchInlineSnapshot(`"-72057594037927940"`);
  expectFail(s.FloatString().safeParse(`hello world`)).toMatchInlineSnapshot(
    `"Expected a numeric string but got \\"hello world\\""`,
  );

  expectOk(
    s.FloatString({min: `1.2`, max: `1.8`}).safeParse(`1.5`),
  ).toMatchInlineSnapshot(`"1.5"`);
  expectFail(
    s.FloatString({min: `1.2`, max: `1.8`}).safeParse(`1.1`),
  ).toMatchInlineSnapshot(
    `"Expected a value greater than or equal to \\"1.2\\" but got \\"1.1\\""`,
  );
  expectFail(
    s.FloatString({min: `1.2`, max: `1.8`}).safeParse(`1.9`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"1.8\\" but got \\"1.9\\""`,
  );

  expectOk(
    s
      .FloatString({min: `0`, max: `72057594037927946`})
      .safeParse(`72057594037927945`),
  ).toMatchInlineSnapshot(`"72057594037927945"`);
  expectOk(
    s
      .FloatString({min: `0`, max: `72057594037927946`})
      .safeParse(`7205759403792794`),
  ).toMatchInlineSnapshot(`"7205759403792794"`);

  expectOk(
    s.FloatString({min: `-20`, max: `30`}).safeParse(`25`),
  ).toMatchInlineSnapshot(`"25"`);
  expectOk(
    s.FloatString({min: `-20`, max: `30`}).safeParse(`0`),
  ).toMatchInlineSnapshot(`"0"`);
  expectOk(
    s.FloatString({min: `-20`, max: `30`}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`"-15"`);
  expectFail(
    s.FloatString({min: `-20`, max: `30`}).safeParse(`35`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"30\\" but got \\"35\\""`,
  );
  expectFail(
    s.FloatString({min: `-20`, max: `30`}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected a value greater than or equal to \\"-20\\" but got \\"-25\\""`,
  );

  expectOk(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`-20`),
  ).toMatchInlineSnapshot(`"-20"`);
  expectOk(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`-17`),
  ).toMatchInlineSnapshot(`"-17"`);
  expectOk(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`"-15"`);
  expectFail(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`17`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"-15\\" but got \\"17\\""`,
  );
  expectFail(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected a value greater than or equal to \\"-20\\" but got \\"-25\\""`,
  );
  expectFail(
    s.FloatString({min: `-20`, max: `-15`}).safeParse(`-5`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"-15\\" but got \\"-5\\""`,
  );
});

test(`Integer`, () => {
  expect(() =>
    s.Integer({min: -1 * Math.pow(2, 64), max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (-18446744073709552000) to be greater than or equal to Number.MIN_SAFE_INTEGER (-9007199254740991)"`,
  );
  expect(() =>
    s.Integer({min: 0, max: Math.pow(2, 64)}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected max (18446744073709552000) to be less than or equal to Number.MAX_SAFE_INTEGER (9007199254740991)"`,
  );
  expect(() => s.Integer({min: 10, max: 3})).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (10) to be less than max (3)"`,
  );

  expectOk(s.Integer().safeParse(100)).toMatchInlineSnapshot(`100`);
  expectOk(s.Integer().safeParse(0)).toMatchInlineSnapshot(`0`);
  expectOk(s.Integer().safeParse(-1)).toMatchInlineSnapshot(`-1`);
  expectFail(s.Integer().safeParse(1.5)).toMatchInlineSnapshot(
    `"Expected an integer between -9007199254740991 and 9007199254740991 but got 1.5"`,
  );
  expectFail(s.Integer().safeParse(Math.pow(2, 56))).toMatchInlineSnapshot(
    `"Expected an integer between -9007199254740991 and 9007199254740991 but got 72057594037927940"`,
  );
  expectFail(s.Integer().safeParse(Math.pow(2, 56) * -1)).toMatchInlineSnapshot(
    `"Expected an integer between -9007199254740991 and 9007199254740991 but got -72057594037927940"`,
  );
  expectFail(
    s.Integer().safeParse(100 + (undefined as any)),
  ).toMatchInlineSnapshot(`"NaN is not a valid number"`);

  expectOk(s.Integer({min: -20, max: 30}).safeParse(25)).toMatchInlineSnapshot(
    `25`,
  );
  expectOk(s.Integer({min: -20, max: 30}).safeParse(0)).toMatchInlineSnapshot(
    `0`,
  );
  expectOk(s.Integer({min: -20, max: 30}).safeParse(-15)).toMatchInlineSnapshot(
    `-15`,
  );
  expectFail(
    s.Integer({min: -20, max: 30}).safeParse(35),
  ).toMatchInlineSnapshot(
    `"Expected an integer between -20 and 30 but got 35"`,
  );
  expectFail(
    s.Integer({min: -20, max: 30}).safeParse(-25),
  ).toMatchInlineSnapshot(
    `"Expected an integer between -20 and 30 but got -25"`,
  );

  expectOk(
    s.Integer({min: -20, max: -15}).safeParse(-20),
  ).toMatchInlineSnapshot(`-20`);
  expectOk(
    s.Integer({min: -20, max: -15}).safeParse(-17),
  ).toMatchInlineSnapshot(`-17`);
  expectOk(
    s.Integer({min: -20, max: -15}).safeParse(-15),
  ).toMatchInlineSnapshot(`-15`);
  expectFail(
    s.Integer({min: -20, max: -15}).safeParse(17),
  ).toMatchInlineSnapshot(
    `"Expected an integer between -20 and -15 but got 17"`,
  );
  expectFail(
    s.Integer({min: -20, max: -15}).safeParse(-25),
  ).toMatchInlineSnapshot(
    `"Expected an integer between -20 and -15 but got -25"`,
  );
  expectFail(
    s.Integer({min: -20, max: -15}).safeParse(-5),
  ).toMatchInlineSnapshot(
    `"Expected an integer between -20 and -15 but got -5"`,
  );
});

test(`IntegerString`, () => {
  expect(() =>
    s.IntegerString({min: `10`, max: `3`}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"10\\") to be less than max (\\"3\\")"`,
  );

  expectOk(s.IntegerString().safeParse(`100`)).toMatchInlineSnapshot(`"100"`);
  expectOk(s.IntegerString().safeParse(`0`)).toMatchInlineSnapshot(`"0"`);
  expectOk(s.IntegerString().safeParse(`-1`)).toMatchInlineSnapshot(`"-1"`);
  expectFail(s.IntegerString().safeParse(`1.5`)).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"1.5\\""`,
  );
  expectFail(s.IntegerString().safeParse(`hello world`)).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"hello world\\""`,
  );
  expectFail(
    s.IntegerString().safeParse(Math.pow(2, 56).toString(10)),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"72057594037927940\\""`,
  );
  expectFail(
    s.IntegerString().safeParse((Math.pow(2, 56) * -1).toString(10)),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"-72057594037927940\\""`,
  );

  expectOk(
    s
      .IntegerString({min: `0`, max: `72057594037927946`})
      .safeParse(`72057594037927945`),
  ).toMatchInlineSnapshot(`"72057594037927945"`);
  expectOk(
    s
      .IntegerString({min: `0`, max: `72057594037927946`})
      .safeParse(`7205759403792794`),
  ).toMatchInlineSnapshot(`"7205759403792794"`);

  expectOk(
    s.IntegerString({min: `-20`, max: `30`}).safeParse(`25`),
  ).toMatchInlineSnapshot(`"25"`);
  expectOk(
    s.IntegerString({min: `-20`, max: `30`}).safeParse(`0`),
  ).toMatchInlineSnapshot(`"0"`);
  expectOk(
    s.IntegerString({min: `-20`, max: `30`}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`"-15"`);
  expectFail(
    s.IntegerString({min: `-20`, max: `30`}).safeParse(`35`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"30\\" but got \\"35\\""`,
  );
  expectFail(
    s.IntegerString({min: `-20`, max: `30`}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"30\\" but got \\"-25\\""`,
  );

  expectOk(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`-20`),
  ).toMatchInlineSnapshot(`"-20"`);
  expectOk(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`-17`),
  ).toMatchInlineSnapshot(`"-17"`);
  expectOk(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`"-15"`);
  expectFail(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`17`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"17\\""`,
  );
  expectFail(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"-25\\""`,
  );
  expectFail(
    s.IntegerString({min: `-20`, max: `-15`}).safeParse(`-5`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"-5\\""`,
  );
});

test(`ParsedBase64Array`, () => {
  const utf8 = `hello world 🎂 🎁 💩`;
  const b64 = Buffer.from(utf8).toString(`base64`);
  expect(Buffer.from(s.ParsedBase64Array().parse(b64)).toString(`utf8`)).toBe(
    utf8,
  );
  expect(s.ParsedBase64Array().serialize(Buffer.from(utf8))).toBe(b64);
});
test(`ParsedBase64String`, () => {
  const utf8 = `hello world 🎂 🎁 💩`;
  const b64 = Buffer.from(utf8).toString(`base64`);
  expect(s.ParsedBase64String().parse(b64)).toBe(utf8);
  expect(s.ParsedBase64String().serialize(utf8)).toBe(b64);
});

test(`ParsedDateString`, () => {
  expect(() =>
    s.ParsedDateString({min: 'hello world'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"hello world\\") to be a valid date string in the form \\"yyyy-mm-dd\\""`,
  );
  expect(() =>
    s.ParsedDateString({max: 'hello world'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected max (\\"hello world\\") to be a valid date string in the form \\"yyyy-mm-dd\\""`,
  );
  expect(() =>
    s.ParsedDateString({min: '2022-02-04', max: '2022-02-01'}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"2022-02-04\\") to be less than max (\\"2022-02-01\\")"`,
  );

  expectOk(s.ParsedDateString().safeParse(`2022-03-15`)).toMatchInlineSnapshot(
    `2022-03-15T00:00:00.000Z`,
  );
  expectFail(
    s.ParsedDateString().safeParse(`2022-02-30`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"2022-02-30\\""`,
  );
  expectFail(
    s.ParsedDateString().safeParse(`2022-02-35`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"2022-02-35\\""`,
  );
  expectFail(
    s.ParsedDateString().safeParse(`hello world`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"0000-01-01\\" and \\"9999-12-30\\" but got \\"hello world\\""`,
  );

  expectOk(
    s
      .ParsedDateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-15`),
  ).toMatchInlineSnapshot(`2022-03-15T00:00:00.000Z`);
  expectOk(
    s
      .ParsedDateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-10`),
  ).toMatchInlineSnapshot(`2022-03-10T00:00:00.000Z`);
  expectFail(
    s
      .ParsedDateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-09`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"2022-03-10\\" and \\"2022-03-20\\" but got \\"2022-03-09\\""`,
  );
  expectOk(
    s
      .ParsedDateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-20`),
  ).toMatchInlineSnapshot(`2022-03-20T00:00:00.000Z`);
  expectFail(
    s
      .ParsedDateString({min: `2022-03-10`, max: `2022-03-20`})
      .safeParse(`2022-03-21`),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"2022-03-10\\" and \\"2022-03-20\\" but got \\"2022-03-21\\""`,
  );

  expectOk(
    s.ParsedDateString().safeSerialize(new Date(`2022-03-15`)),
  ).toMatchInlineSnapshot(`"2022-03-15"`);
  expectFail(
    s.ParsedDateString().safeSerialize(new Date(`2022-03-15T11:00:00Z`)),
  ).toMatchInlineSnapshot(
    `"Expected a Date with no time portion but got 2022-03-15T11:00:00.000Z"`,
  );
  expectFail(
    s
      .ParsedDateString({min: '2022-03-10'})
      .safeSerialize(new Date(`2022-03-05`)),
  ).toMatchInlineSnapshot(
    `"Expected a date in form \\"yyyy-mm-dd\\" between \\"2022-03-10\\" and \\"9999-12-30\\" but got \\"2022-03-05\\""`,
  );
});

test(`ParsedDateTimeString`, () => {
  expectOk(
    s.ParsedDateTimeString({strict: false}).safeParse(`2022-03-15T11:00:00Z`),
  ).toMatchInlineSnapshot(`2022-03-15T11:00:00.000Z`);
  expectFail(
    s.ParsedDateTimeString({strict: false}).safeParse(`hello world`),
  ).toMatchInlineSnapshot(`"\\"hello world\\" is not a valid date"`);
  expectFail(
    s.ParsedDateTimeString({strict: false}).safeParse(`2022-03-38T00:00:00Z`),
  ).toMatchInlineSnapshot(`"\\"2022-03-38T00:00:00Z\\" is not a valid date"`);

  expectOk(
    s.ParsedDateTimeString({strict: false}).safeParse(`2022-02-31T00:00:00Z`),
  ).toMatchInlineSnapshot(`2022-03-03T00:00:00.000Z`);
  expectFail(
    s.ParsedDateTimeString({strict: true}).safeParse(`2022-02-31T00:00:00Z`),
  ).toMatchInlineSnapshot(
    `"\\"2022-02-31T00:00:00Z\\" is not a valid date in the full ISO8601 format."`,
  );
  expectOk(
    s.ParsedDateTimeString({strict: true}).safeParse(`2022-02-28T00:00:00Z`),
  ).toMatchInlineSnapshot(`2022-02-28T00:00:00.000Z`);
  expectOk(
    s.ParsedDateTimeString({strict: false}).safeParse(`1 March 2022`),
  ).toMatchInlineSnapshot(`2022-03-01T00:00:00.000Z`);
  expectFail(
    s.ParsedDateTimeString({strict: true}).safeParse(`1 March 2022`),
  ).toMatchInlineSnapshot(
    `"\\"1 March 2022\\" is not a valid date in the full ISO8601 format."`,
  );

  expectOk(
    s
      .ParsedDateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-15`),
  ).toMatchInlineSnapshot(`2022-03-15T00:00:00.000Z`);
  expectFail(
    s
      .ParsedDateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-09`),
  ).toMatchInlineSnapshot(
    `"Expected a date on or after 2022-03-10T00:00:00.000Z but got \\"2022-03-09\\""`,
  );
  expectFail(
    s
      .ParsedDateTimeString({
        min: new Date(`2022-03-10`),
        max: new Date(`2022-03-20`),
        strict: false,
      })
      .safeParse(`2022-03-21`),
  ).toMatchInlineSnapshot(
    `"Expected a date on or before 2022-03-20T00:00:00.000Z but got \\"2022-03-21\\""`,
  );

  expectOk(
    s
      .ParsedDateTimeString({strict: false})
      .safeSerialize(new Date(`2022-03-15`)),
  ).toMatchInlineSnapshot(`"2022-03-15T00:00:00.000Z"`);
  expectOk(
    s
      .ParsedDateTimeString({strict: false})
      .safeSerialize(new Date(`2022-03-15T11:00:00Z`)),
  ).toMatchInlineSnapshot(`"2022-03-15T11:00:00.000Z"`);
  expectFail(
    s
      .ParsedDateTimeString({min: new Date('2022-03-10'), strict: false})
      .safeSerialize(new Date(`2022-03-05`)),
  ).toMatchInlineSnapshot(
    `"Expected a date on or after 2022-03-10T00:00:00.000Z but got 2022-03-05T00:00:00.000Z"`,
  );
});

test(`ParsedFloatString`, () => {
  expect(() =>
    s.ParsedFloatString({min: 10, max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"10\\") to be less than max (\\"3\\")"`,
  );

  expectOk(s.ParsedFloatString().safeParse(`100`)).toMatchInlineSnapshot(`100`);
  expectOk(s.ParsedFloatString().safeParse(`0`)).toMatchInlineSnapshot(`0`);
  expectOk(s.ParsedFloatString().safeParse(`-1`)).toMatchInlineSnapshot(`-1`);
  expectOk(s.ParsedFloatString().safeParse(`1.5`)).toMatchInlineSnapshot(`1.5`);
  expectOk(
    s.ParsedFloatString().safeParse(Math.pow(2, 56).toString(10)),
  ).toMatchInlineSnapshot(`72057594037927940`);
  expectOk(
    s.ParsedFloatString().safeParse((Math.pow(2, 56) * -1).toString(10)),
  ).toMatchInlineSnapshot(`-72057594037927940`);

  expectOk(
    s.ParsedFloatString({min: -20, max: 30}).safeParse(`25`),
  ).toMatchInlineSnapshot(`25`);
  expectOk(
    s.ParsedFloatString({min: -20, max: 30}).safeParse(`0`),
  ).toMatchInlineSnapshot(`0`);
  expectOk(
    s.ParsedFloatString({min: -20, max: 30}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`-15`);
  expectFail(
    s.ParsedFloatString({min: -20, max: 30}).safeParse(`35`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"30\\" but got \\"35\\""`,
  );
  expectFail(
    s.ParsedFloatString({min: -20, max: 30}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected a value greater than or equal to \\"-20\\" but got \\"-25\\""`,
  );

  expectOk(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`-20`),
  ).toMatchInlineSnapshot(`-20`);
  expectOk(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`-17`),
  ).toMatchInlineSnapshot(`-17`);
  expectOk(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`-15`);
  expectFail(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`17`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"-15\\" but got \\"17\\""`,
  );
  expectFail(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected a value greater than or equal to \\"-20\\" but got \\"-25\\""`,
  );
  expectFail(
    s.ParsedFloatString({min: -20, max: -15}).safeParse(`-5`),
  ).toMatchInlineSnapshot(
    `"Expected a value less than or equal to \\"-15\\" but got \\"-5\\""`,
  );

  expectOk(s.ParsedFloatString().safeSerialize(42)).toMatchInlineSnapshot(
    `"42"`,
  );
  expectOk(s.ParsedFloatString().safeSerialize(1.5)).toMatchInlineSnapshot(
    `"1.5"`,
  );
  expectFail(
    s.ParsedFloatString({min: 56}).safeSerialize(42),
  ).toMatchInlineSnapshot(
    `"Expected value to be greater than or equal to 56 but got 42"`,
  );
});

test(`ParsedIntegerString`, () => {
  expect(() =>
    s.ParsedIntegerString({min: 10, max: 3}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected min (\\"10\\") to be less than max (\\"3\\")"`,
  );

  expectOk(s.ParsedIntegerString().safeParse(`100`)).toMatchInlineSnapshot(
    `100`,
  );
  expectOk(s.ParsedIntegerString().safeParse(`0`)).toMatchInlineSnapshot(`0`);
  expectOk(s.ParsedIntegerString().safeParse(`-1`)).toMatchInlineSnapshot(`-1`);
  expectFail(s.ParsedIntegerString().safeParse(`1.5`)).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"1.5\\""`,
  );
  expectFail(
    s.ParsedIntegerString().safeParse(Math.pow(2, 56).toString(10)),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"72057594037927940\\""`,
  );
  expectFail(
    s.ParsedIntegerString().safeParse((Math.pow(2, 56) * -1).toString(10)),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-9007199254740991\\" and \\"9007199254740991\\" but got \\"-72057594037927940\\""`,
  );

  expectOk(
    s.ParsedIntegerString({min: -20, max: 30}).safeParse(`25`),
  ).toMatchInlineSnapshot(`25`);
  expectOk(
    s.ParsedIntegerString({min: -20, max: 30}).safeParse(`0`),
  ).toMatchInlineSnapshot(`0`);
  expectOk(
    s.ParsedIntegerString({min: -20, max: 30}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`-15`);
  expectFail(
    s.ParsedIntegerString({min: -20, max: 30}).safeParse(`35`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"30\\" but got \\"35\\""`,
  );
  expectFail(
    s.ParsedIntegerString({min: -20, max: 30}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"30\\" but got \\"-25\\""`,
  );

  expectOk(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`-20`),
  ).toMatchInlineSnapshot(`-20`);
  expectOk(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`-17`),
  ).toMatchInlineSnapshot(`-17`);
  expectOk(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`-15`),
  ).toMatchInlineSnapshot(`-15`);
  expectFail(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`17`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"17\\""`,
  );
  expectFail(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`-25`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"-25\\""`,
  );
  expectFail(
    s.ParsedIntegerString({min: -20, max: -15}).safeParse(`-5`),
  ).toMatchInlineSnapshot(
    `"Expected an integer string between \\"-20\\" and \\"-15\\" but got \\"-5\\""`,
  );

  expectOk(s.ParsedIntegerString().safeSerialize(42)).toMatchInlineSnapshot(
    `"42"`,
  );
  expectFail(s.ParsedIntegerString().safeSerialize(1.5)).toMatchInlineSnapshot(
    `"Expected an integer between -9007199254740991 and 9007199254740991 but got 1.5"`,
  );
  expectFail(
    s.ParsedIntegerString({min: 56}).safeSerialize(42),
  ).toMatchInlineSnapshot(
    `"Expected an integer between 56 and 9007199254740991 but got 42"`,
  );
});

test(`ParsedUrlString`, () => {
  expect(() =>
    s.ParsedUrlString({allowedProtocols: new Set(['http', 'https'])}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invalid protocol, \\"http\\". Did you mean: \\"http:\\"?"`,
  );

  expectOk(
    s.ParsedUrlString().safeParse(`http://example.com`),
  ).toMatchInlineSnapshot(`"http://example.com/"`);
  expectOk(
    s.ParsedUrlString().safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);

  expectOk(
    s
      .ParsedUrlString({allowedProtocols: new Set([`http:`, `https:`])})
      .safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);
  expectFail(
    s
      .ParsedUrlString({allowedProtocols: new Set([`https:`])})
      .safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(
    `"Invalid protocol \\"http:\\", expected one of: \\"https:\\" for URL \\"http://example.com/foo/bar\\""`,
  );
  expectFail(s.ParsedUrlString().safeParse(`http:?/~~`)).toMatchInlineSnapshot(
    `"Invalid URL: http:?/~~"`,
  );

  expectOk(
    s
      .ParsedUrlString({allowedProtocols: new Set([`http:`, `https:`])})
      .safeSerialize(new URL(`http://example.com/foo/bar`)),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);
  expectFail(
    s
      .ParsedUrlString({allowedProtocols: new Set([`https:`])})
      .safeSerialize(new URL(`http://example.com/foo/bar`)),
  ).toMatchInlineSnapshot(
    `"Invalid protocol \\"http:\\", expected one of: \\"https:\\" for URL \\"http://example.com/foo/bar\\""`,
  );
});

test(`Url`, () => {
  expect(() =>
    s.Url({allowedProtocols: new Set(['http', 'https'])}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invalid protocol, \\"http\\". Did you mean: \\"http:\\"?"`,
  );

  expectOk(
    s.Url().safeParse(new URL(`http://example.com`)),
  ).toMatchInlineSnapshot(`"http://example.com/"`);
  expectOk(
    s.Url().safeParse(new URL(`http://example.com/foo/bar`)),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);

  expectOk(
    s
      .Url({allowedProtocols: new Set([`http:`, `https:`])})
      .safeParse(new URL(`http://example.com/foo/bar`)),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);
  expectFail(
    s
      .Url({allowedProtocols: new Set([`https:`])})
      .safeParse(new URL(`http://example.com/foo/bar`)),
  ).toMatchInlineSnapshot(
    `"Invalid protocol \\"http:\\", expected one of: \\"https:\\" for URL \\"http://example.com/foo/bar\\""`,
  );
});

test(`UrlString`, () => {
  expect(() =>
    s.UrlString({allowedProtocols: new Set(['http', 'https'])}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invalid protocol, \\"http\\". Did you mean: \\"http:\\"?"`,
  );

  expectOk(s.UrlString().safeParse(`http://example.com`)).toMatchInlineSnapshot(
    `"http://example.com/"`,
  );
  expectOk(
    s.UrlString().safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);

  expectOk(
    s
      .UrlString({allowedProtocols: new Set([`http:`, `https:`])})
      .safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);
  expectFail(
    s
      .UrlString({allowedProtocols: new Set([`https:`])})
      .safeParse(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(
    `"Invalid protocol \\"http:\\", expected one of: \\"https:\\" for URL \\"http://example.com/foo/bar\\""`,
  );
  expectFail(s.UrlString().safeParse(`http:?/~~`)).toMatchInlineSnapshot(
    `"Invalid URL: http:?/~~"`,
  );

  expectOk(
    s
      .UrlString({allowedProtocols: new Set([`http:`, `https:`])})
      .safeSerialize(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(`"http://example.com/foo/bar"`);
  expectFail(
    s
      .UrlString({allowedProtocols: new Set([`https:`])})
      .safeSerialize(`http://example.com/foo/bar`),
  ).toMatchInlineSnapshot(
    `"Invalid protocol \\"http:\\", expected one of: \\"https:\\" for URL \\"http://example.com/foo/bar\\""`,
  );
  expectFail(s.UrlString().safeSerialize(`http:?/~~`)).toMatchInlineSnapshot(
    `"Invalid URL: http:?/~~"`,
  );
});

test('s', () => {
  expect(s).toMatchInlineSnapshot(`
    Object {
      "Base64String": [Function],
      "ConstrainLength": [Function],
      "DateString": [Function],
      "DateTime": [Function],
      "DateTimeString": [Function],
      "Float": [Function],
      "FloatString": [Function],
      "Integer": [Function],
      "IntegerString": [Function],
      "ParsedBase64Array": [Function],
      "ParsedBase64String": [Function],
      "ParsedDateString": [Function],
      "ParsedDateTimeString": [Function],
      "ParsedFloatString": [Function],
      "ParsedIntegerString": [Function],
      "ParsedUrlString": [Function],
      "Url": [Function],
      "UrlString": [Function],
    }
  `);
});
