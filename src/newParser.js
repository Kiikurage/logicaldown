var fs = require('fs'),
	Token = require('./token.js');

function Parser(params) {
	params = params || {};

	/**
	 * 入力文字列
	 */
	this.input = params.input || '';

	/**
	 * シンボルの一覧
	 */
	this.symbolMap = new Map();

	/**
	 * シンボルIDの一覧
	 */
	this.symbolIDMap = new Map();
}

/**
 * generate GUID
 * @return {number} guid
 */
var guid = (function() {
	var guid = 0;
	return function() {
		return ++guid;
	};
})();

/**
 * 文法データを登録する
 * @param {string} filePath 文法データのパス
 */
Parser.prototype.registerGrammer = function(filePath) {
	var self = this;

	fs.readFileSync(filePath, 'utf-8')
		.split(';')
		.map(function(grammer) {
			return grammer.trim().split('<-');
		})
		.filter(function(grammerParts) {
			return grammerParts.length === 2;
		})
		.forEach(function(grammerParts) {
			var name = grammerParts[0].trim(),
				pattern = grammerParts[1].trim();

			if (!self.symbolMap.has(name)) {
				self.symbolMap.set(guid(), name);
			}
		});
};

Parser.prototype.registerSymbol = function(symbol) {

};

/**
 * トークン配列を返す
 * @return {Array<Token>} トークンの配列
 */
Parser.prototype.tokenize = function() {

};

module.exports = Parser;
