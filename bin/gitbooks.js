#!/usr/bin/env node

const chalk = require('chalk');
const spawn = require('cross-spawn');

const script = process.argv[2];
const args = process.argv.slice(3);

var result; // eslint-disable-line

switch (script) {
  case '-v':
  case '--version':
    console.log(require('../package.json').version); // eslint-disable-line
    break;
  case 'gen':
    result = spawn.sync(
      'node',
      [require.resolve(`../${script}`)].concat(args),
      { stdio: 'inherit' } // eslint-disable-line
    );
    process.exit(result.status);
    break;
  default:
    console.log(`Unknown script ${chalk.cyan(script)}.`);
    break;
}
