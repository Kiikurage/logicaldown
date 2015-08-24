var parser = require('./grammer.js');

console.log(parser.parse(require('fs').readFileSync('./sample.md', 'utf8')));