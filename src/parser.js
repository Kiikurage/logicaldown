var fs = require('fs'),
	path = require('path'),
	Symbol = require('./symbol.js'),
	Tokenizer = require('./tokenizer.js'),
	util = require('./util.js');

function Parser() {
	/**
	 * 文法の一覧
	 * @type {Array<Parser.Grammer>}
	 * @private
	 */
	this.grammerList_ = [];

	/**
	 * アクションテーブル
	 * @tye {Array<Object>}
	 * @private
	 */
	this.actionTable_ = null;

	/**
	 * 字句解析器
	 * @type {Tokenizer}
	 * @private
	 */
	this.tokenizer_ = new Tokenizer();
}

/**
 * 開始記号
 * @const {string}
 */
Parser.START_SYMBOL = '__START__';

/**
 * 終端記号
 * @const {string}
 */
Parser.TERMINAL_SYMBOL = '__TERMINAL__';

/**
 * 全体記号
 * @const {string}
 */
Parser.ANY_SYMBOL = '__ANY__';

/**
 * @typedef {{
 *   symbol: string,
 *   to: Array<string>
 * }}
 */
Parser.Grammer;

/**
 * @typedef {{
 *   symbol: string,
 *   stack: Array<string>,
 *   expect: Array<string>
 * }}
 */
Parser.Item;

/**
 * @typedef {{
 *   type: string,				タイプ名
 *   text: sting,				文字列
 *   children: Array<string>	子トークン
 * }}
 */
Parser.Token;

/**
 * パースする
 * @param {Array<Symbol>} inputFilePath 入力ファイルのパス
 */
Parser.prototype.parse = function(inputFilePath) {
	var input = fs.readFileSync(inputFilePath, 'utf8');

	if (!this.actionTable_) this.createActionTable_();

	var tokens = this.tokenizer_.tokenize(input);

	tokens.push(new Symbol({
		name: Parser.TERMINAL_SYMBOL,
		isTerminal: true
	}));

	var result = this.parseCore_(tokens);

	if (result.error) {
		util.error(
			result.error.title,
			inputFilePath,
			input,
			result.error.pos,
			result.error.len
		);
		process.exit();
	}

	return result.output;
};

Parser.prototype.parseCore_ = function(tokens) {
	var token, state, action, grammer, children;
	var table = this.actionTable_,
		output = [],
		stack = [0];

	while (true) {
		token = tokens.shift(),
			state = stack[0];

		if (!token) break;

		if (table[state][Parser.ANY_SYMBOL]) {
			action = table[state][Parser.ANY_SYMBOL];

			grammer = this.grammerList_[action];

			children = output.splice(output.length - grammer.to.length, grammer.to.length);
			output.push(new Symbol({
				name: grammer.symbol,
				children: children,
				from: children[0].from
			}));

			stack.splice(0, grammer.to.length);
			stack.unshift(table[stack[0]][grammer.symbol]);
			tokens.unshift(token);
		} else {
			action = table[state][token.name];
			stack.unshift(table[state][token.name]);
			output.push(token);
		}

		if (!stack[0] && tokens.length !== 0) {
			return {
				output: output,
				error: {
					title: 'Unexpected token',
					pos: token.from,
					len: token.text.length
				}
			};
		}
	}

	return {
		output: output,
		error: null
	};
};

/**
 * 文法を登録する
 * @param {Parser.Grammer|Array<Parser.Grammer>} grammer 文法
 */
Parser.prototype.registerGrammer = function(grammer) {
	if (grammer instanceof Array) {
		grammer.forEach(function(g) {
			this.registerGrammer(g);
		}, this);
		return;
	}

	this.grammerList_.push({
		symbol: grammer.symbol,
		to: grammer.to.slice(0)
	});
};

/**
 * トークンパターンを登録する
 * @param {Tokenizer.TokenPattern|Array<Tokenizer.TokenPattern>} pattern パターン
 */
Parser.prototype.registerTokenPattern = function(tokenPattern) {
	this.tokenizer_.registerTokenPattern(tokenPattern);
};

/**
 * アクションテーブルを作成する
 * @return {Object} アクションテーブル
 */
Parser.prototype.createActionTable_ = function() {
	var list = this.createItemGroupList_(),
		table = list.matrix,
		grammerList_ = this.grammerList_;

	list.groups.forEach(function(group, groupId) {
		group.forEach(function(item) {
			var i;
			if (item.expect.length !== 0) return;

			for (i = 1; i < grammerList_.length; i++) {
				if (grammerList_[i].symbol === item.symbol &&
					grammerList_[i].to.join(' ') === item.stack.join(' ')) {
					table[groupId][Parser.ANY_SYMBOL] = i;
					break;
				}
			}

		});
	});

	this.actionTable_ = table;
};

/**
 * アイテム集合リストを作成する
 * @return {Object} アイテム集合リスト
 */
Parser.prototype.createItemGroupList_ = function() {
	var list = {
			matrix: [],
			groups: []
		},
		itemGroup = [];

	/**
	 * 開始記号から始まる文法を探す
	 */
	for (var i = 0; i < this.grammerList_.length; i++) {
		if (this.grammerList_[i].symbol === Parser.START_SYMBOL) {
			itemGroup.push({
				symbol: Parser.START_SYMBOL,
				stack: [],
				expect: this.grammerList_[i].to
			});
		}
	}
	/**
	 * アイテム集合の拡張
	 */
	this.extendItemGroup_(itemGroup);

	list.groups.push(itemGroup);
	this.createItemGroup_(list, 0);

	return list;
};

/**
 * アイテム集合を作成する
 * @param {Object} list アイテム集合のリスト
 * @param {Array<Parser.Item>} itemGroup 現在のアイテム集合id
 */
Parser.prototype.createItemGroup_ = function(list, itemGroupId) {
	var itemGroupCopy = list.groups[itemGroupId].slice(0),
		newGroups = [],
		newGroup, coreSymbol, i;

	list.matrix[itemGroupId] = {};

	while (itemGroupCopy.length > 0) {
		coreSymbol = itemGroupCopy[0].expect[0];
		if (!coreSymbol) {
			itemGroupCopy.splice(0, 1);
			continue;
		}

		newGroup = [];
		for (i = 0; i < itemGroupCopy.length; i++) {
			if (itemGroupCopy[i].expect[0] !== coreSymbol) continue;

			newGroup.push({
				symbol: itemGroupCopy[i].symbol,
				stack: itemGroupCopy[i].stack.slice(0),
				expect: itemGroupCopy[i].expect.slice(0)
			});
			itemGroupCopy.splice(i, 1);
			i--;
		}

		for (i = 0; i < newGroup.length; i++) {
			newGroup[i].expect.shift();
			newGroup[i].stack.push(coreSymbol);
		}

		this.extendItemGroup_(newGroup);

		list.groups.push(newGroup);
		newGroup.id = list.groups.length - 1;
		newGroups.push(newGroup);

		list.matrix[itemGroupId][coreSymbol] = newGroup.id;
	}

	newGroups.forEach(function(newGroup) {
		this.createItemGroup_(list, newGroup.id);
	}, this);
};

/**
 * アイテム集合を拡張する
 * @param {Array<Parser.Item>} itemGroup アイテム集合
 * @param {Number} [from=0] 何番目のアイテムから拡張するか
 */
Parser.prototype.extendItemGroup_ = function(itemGroup, from) {
	/**
	 * クロージャに追加したシンボルの一覧
	 */
	var parsedSymbol = [];

	for (var i = from || 0; i < itemGroup.length; i++) {
		var item = itemGroup[i],
			expectedSymbol = item.expect[0];

		if (!expectedSymbol || parsedSymbol.indexOf(expectedSymbol) !== -1) continue;
		parsedSymbol.push(expectedSymbol);

		for (var j = 0; j < this.grammerList_.length; j++) {
			var grammer = this.grammerList_[j];

			if (grammer.symbol === expectedSymbol) {
				itemGroup.push({
					symbol: expectedSymbol,
					stack: item.expect.slice(1),
					expect: grammer.to
				});
			}
		}
	}
};

module.exports = Parser;
