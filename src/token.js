function Token(params) {
	params = params || {};

	/**
	 * 名前
	 * @type {string}
	 */
	this.name = params.name || '';

	/**
	 * 実際の文字列
	 * @type {string}
	 */
	this.text = params.text || '';

	/**
	 * 子トークン
	 * @type {Array<Symbol>}
	 */
	this.children = params.children || [];

	/**
	 * 終端記号かどうか
	 * @type {boolean}
	 */
	this.isTerminal = params.isTerminal || false;

	/**
	 * 元の文章における位置
	 * @type {number}
	 */
	this.from = params.from || 0;
}

Token.prototype.outputWithFormat = function() {
	return "<" + this.name + ">" +
		this.children.map(function(child) {
			return child.outputWithFormat();
		}).join('') + this.text.trim() +
		"</" + this.name + ">";
	// }
};

module.exports = Token;
