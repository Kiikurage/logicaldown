var Symbol = require('./symbol.js');

function Tokenizer() {
	/**
	 * トークンパターンの一覧
	 * @type {Array<Tokenizer.TokenPattern>}
	 * @private
	 */
	this.tokenPatternList_ = [];
}

/**
 * 字句解析失敗
 * @const {string}
 */
Tokenizer.ERR_TOKENIZE_FAILED = 'Tokenize Failed';

/**
 * @typedef {{
 *   name: string		パターン名
 *   pattern: RegExp	パターンの正規表現
 * }}
 */
Tokenizer.TokenPattern;

/**
 * 解析を行う
 * @param {string} input 解析する文字列
 */
Tokenizer.prototype.tokenize = function(input) {
	var start = 0,
		current = 0,
		inputLength = input.length,
		lastToken = null,
		patterns = this.tokenPatternList_,
		isMatch, text, i,
		result = [];

	/**
	 * 現在のlastTokenをトークンとして出力する
	 */
	var outputToken = function() {
		if (!lastToken) throw new Error(Tokenizer.ERR_TOKENIZE_FAILED);

		if (!lastToken.ignore) {
			result.push(lastToken);
		}
		start = current;
		current = start - 1;
		lastToken = null;
	};

	while (true) {
		if (current >= inputLength) {
			outputToken();
			break;
		}

		text = input.substring(start, current + 1);
		isMatch = false;

		for (i = 0; i < patterns.length; i++) {
			if (!text.match(patterns[i].pattern)) continue;
			isMatch = true;
			lastToken = new Symbol({
				name: patterns[i].name,
				text: text,
				isTerminal: true,
				from: start,
				ignore: patterns[i].ignore
			});
			break;
		}

		if (!isMatch) {
			outputToken();
		}

		current++;
	}

	return result;
};

/**
 * トークンパターンを登録する
 * @param {Tokenizer.TokenPattern|Array<Tokenizer.TokenPattern>} pattern パターン
 */
Tokenizer.prototype.registerTokenPattern = function(pattern) {
	if (pattern instanceof Array) {
		return pattern.forEach(function(p) {
			this.registerTokenPattern(p);
		}, this);
	}

	this.tokenPatternList_.push({
		name: pattern.name,
		pattern: new RegExp('^'+pattern.pattern+'$')
	});
};

module.exports = Tokenizer;
