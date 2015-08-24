var fs = require('fs'),
	PEG = require("pegjs");

var parser = PEG.buildParser(fs.readFileSync('./src/markdown.pegjs', 'utf8'));

console.log(parser.parse(fs.readFileSync('./sample.md', 'utf8')));
