var	path = require('path');

exports.error = function error(title, inputFilePath, input, pos, len){
	var RED = '\x1b[31;m',
		YELLOW = '\x1b[33;m',
		NORMAL = '\x1b[;m';
		 
	var column = pos,
		line = 1,
		input = input.split('\n'),
		basename = path.basename(inputFilePath);
		
	while (column > input[line-1].length) {
		column -= input[line-1].length + 1;
		line++;
	}

	console.error('%s:%d', basename, pos);

	console.error('\t' + input[line-1]);
	console.error('\t' +
		new Array(column+1).join(' ') +
		RED + new Array(len+1).join('^') + NORMAL
	);

	console.error('Error: %s', title);
	console.error('\tat %s:%d:%d', inputFilePath, line, column);
};