function Symbol(params) {
	params = params || {};

	/**
	 * シンボル名
	 * @type {string}
	 */
	this.name = params.name || '';

	/**
	 * 実際の文字列
	 * @type {string}
	 */
	this.text = params.text || '';

	/**
	 * 子シンボル
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

	/**
	 * このシンボルを無視できるか
	 * @type {boolean}
	 */
	this.ignore = params.ignore || false;
}

Symbol.prototype.outputWithFormat = function() {
	// if (this.children.length === 1) {
	// 	return this.children[0].outputWithFormat() + this.text.trim();
	// } else {
	return "<" + this.name + ">" +
		this.children.map(function(child) {
			return child.outputWithFormat();
		}).join('') + this.text.trim() +
		"</" + this.name + ">";
	// }
};

module.exports = Symbol;
