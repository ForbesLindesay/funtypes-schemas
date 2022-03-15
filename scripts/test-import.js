const {spawnSync} = require('child_process');
const {mkdtempSync, writeFileSync, readdirSync} = require('fs');
const {tmpdir} = require('os');
const {join, resolve, relative} = require('path');

console.info(`$ npm pack`);
inheritExit(
  spawnSync(`npm`, [`pack`], {cwd: join(__dirname, `..`), stdio: `inherit`}),
);

const OUTPUTS = [
  {
    name: `test.cjs`,
    header: [
      `const assert = require('assert');`,
      `const s = require('funtypes-schemas');`,
    ],
  },
  {
    name: `test.mjs`,
    header: [
      `import assert from 'assert';`,
      `import * as s from 'funtypes-schemas';`,
    ],
  },
];

const assertions = readdirSync(`${__dirname}/../src/types`)
  .filter((n) => n.endsWith(`.ts`))
  .map((n) => n.substring(0, n.length - `.ts`.length))
  .map((n) => `assert(typeof s.${n} === 'function');`);

const dir = mkdtempSync(join(tmpdir(), `funtypes-schemas`));
for (const {name, header} of OUTPUTS) {
  writeFileSync(
    join(dir, name),
    [
      ...header,
      ``,
      ...assertions,
      ``,
      `console.log("✅ Import Tests Passed")`,
      ``,
    ].join(`\n`),
  );
}

writeFileSync(
  join(dir, `package.json`),
  JSON.stringify({
    name: 'funtypes-schema-test-import',
    private: true,
    dependencies: {
      funtypes: require('../package.json').devDependencies.funtypes,
    },
  }) + `\n`,
);

console.info(`$ npm install`);
inheritExit(spawnSync(`npm`, [`install`], {cwd: dir, stdio: `inherit`}));

const packPath = relative(
  join(dir, `package.json`),
  resolve(join(__dirname, `..`, `funtypes-schemas-0.0.0.tgz`)),
);
console.info(`$ npm install ${packPath}`);
inheritExit(
  spawnSync(`npm`, [`install`, packPath], {cwd: dir, stdio: `inherit`}),
);

for (const {name} of OUTPUTS) {
  console.info(`$ node ${join(dir, name)}`);
  inheritExit(
    spawnSync(`node`, [join(dir, name)], {cwd: dir, stdio: `inherit`}),
  );
}

function inheritExit(proc) {
  if (proc.status !== 0) process.exit(proc.status);
}
