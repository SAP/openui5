/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

sap.ui.define([], function() {
	"use strict";

	/*
	 * The following code has been taken from the component JSON in JavaScript
	 * from Douglas Crockford which is licensed under Public Domain
	 * (http://www.json.org/ > JavaScript > json-2). The code contains
	 * local modifications.
	 *
	 * Git URL: https://github.com/douglascrockford/JSON-js/blob/ff55d8d4513b149e2511aee01c3a61d372837d1f/json_parse.js
	 */

	/**
	 * @class Tokenizer for JS values.
	 *
	 * Contains functions to consume tokens on an input string.
	 *
	 * @example
	 * sap.ui.require(["sap/base/util/JSTokenizer"], function(JSTokenizer){
	 *      JSTokenizer().parseJS("{test:'123'}"); // {test:'123'}
	 * });
	 *
	 * @alias module:sap/base/util/JSTokenizer
	 * @since 1.58
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var JSTokenizer = function() {
		this.escapee = {
			'"': '"',
			'\'': '\'',
			'\\': '\\',
			'/': '/',
			b: '\b',
			f: '\f',
			n: '\n',
			r: '\r',
			t: '\t'
		};
	};


	JSTokenizer.prototype.error = function(m) {

		// Call error when something is wrong.
		throw {
			name: 'SyntaxError',
			message: m,
			at: this.at,
			text: this.text
		};
	};

	JSTokenizer.prototype.next = function(c) {

		// If a c parameter is provided, verify that it matches the current character.
		if (c && c !== this.ch) {
			this.error("Expected '" + c + "' instead of '" + this.ch + "'");
		}

		// Get the next character. When there are no more characters,
		// return the empty string.
		this.ch = this.text.charAt(this.at);
		this.at += 1;
		return this.ch;
	};

	JSTokenizer.prototype.number = function() {

		// Parse a number value.
		var number, string = '';

		if (this.ch === '-') {
			string = '-';
			this.next('-');
		}
		while (this.ch >= '0' && this.ch <= '9') {
			string += this.ch;
			this.next();
		}
		if (this.ch === '.') {
			string += '.';
			while (this.next() && this.ch >= '0' && this.ch <= '9') {
				string += this.ch;
			}
		}
		if (this.ch === 'e' || this.ch === 'E') {
			string += this.ch;
			this.next();
			if (this.ch === '-' || this.ch === '+') {
				string += this.ch;
				this.next();
			}
			while (this.ch >= '0' && this.ch <= '9') {
				string += this.ch;
				this.next();
			}
		}
		number = +string;
		if (!isFinite(number)) {
			this.error("Bad number");
		} else {
			return number;
		}
	};

	JSTokenizer.prototype.string = function() {

		// Parse a string value.
		var hex, i, string = '', quote,
			uffff;

		// When parsing for string values, we must look for " and \ characters.
		if (this.ch === '"' || this.ch === '\'') {
			quote = this.ch;
			while (this.next()) {
				if (this.ch === quote) {
					this.next();
					return string;
				}
				if (this.ch === '\\') {
					this.next();
					if (this.ch === 'u') {
						uffff = 0;
						for (i = 0; i < 4; i += 1) {
							hex = parseInt(this.next(), 16);
							if (!isFinite(hex)) {
								break;
							}
							uffff = uffff * 16 + hex;
						}
						string += String.fromCharCode(uffff);
					} else if (typeof this.escapee[this.ch] === 'string') {
						string += this.escapee[this.ch];
					} else {
						break;
					}
				} else {
					string += this.ch;
				}
			}
		}
		this.error("Bad string");
	};

	JSTokenizer.prototype.name = function() {

		// Parse a name value.
		var name = '',
			allowed = function(ch) {
				return ch === "_" || ch === "$" ||
					(ch >= "0" && ch <= "9") ||
					(ch >= "a" && ch <= "z") ||
					(ch >= "A" && ch <= "Z");
			};

		if (allowed(this.ch)) {
			name += this.ch;
		} else {
			this.error("Bad name");
		}

		while (this.next()) {
			if (this.ch === ' ') {
				this.next();
				return name;
			}
			if (this.ch === ':') {
				return name;
			}
			if (allowed(this.ch)) {
				name += this.ch;
			} else {
				this.error("Bad name");
			}
		}
		this.error("Bad name");
	};

	JSTokenizer.prototype.white = function() {

		// Skip whitespace.
		while (this.ch && this.ch <= ' ') {
			this.next();
		}
	};

	JSTokenizer.prototype.word = function() {

		// true, false, or null.
		switch (this.ch) {
		case 't':
			this.next('t');
			this.next('r');
			this.next('u');
			this.next('e');
			return true;
		case 'f':
			this.next('f');
			this.next('a');
			this.next('l');
			this.next('s');
			this.next('e');
			return false;
		case 'n':
			this.next('n');
			this.next('u');
			this.next('l');
			this.next('l');
			return null;
		}
		this.error("Unexpected '" + this.ch + "'");
	};

		//value, // Place holder for the value function.
	JSTokenizer.prototype.array = function() {

		// Parse an array value.
		var array = [];

		if (this.ch === '[') {
			this.next('[');
			this.white();
			if (this.ch === ']') {
				this.next(']');
				return array; // empty array
			}
			while (this.ch) {
				array.push(this.value());
				this.white();
				if (this.ch === ']') {
					this.next(']');
					return array;
				}
				this.next(',');
				this.white();
			}
		}
		this.error("Bad array");
	};

	var object = function() {

		// Parse an object value.
		var key, object = {};

		if (this.ch === '{') {
			this.next('{');
			this.white();
			if (this.ch === '}') {
				this.next('}');
				return object; // empty object
			}
			while (this.ch) {
				if (this.ch >= "0" && this.ch <= "9") {
					key = this.number();
				} else if (this.ch === '"' || this.ch === '\'') {
					key = this.string();
				} else {
					key = this.name();
				}
				this.white();
				this.next(':');
				if (Object.hasOwn(object, key)) {
					this.error('Duplicate key "' + key + '"');
				}
				object[key] = this.value();
				this.white();
				if (this.ch === '}') {
					this.next('}');
					return object;
				}
				this.next(',');
				this.white();
			}
		}
		this.error("Bad object");
	};

	JSTokenizer.prototype.value = function() {

		// Parse a JS value. It could be an object, an array, a string, a number,
		// or a word.
		this.white();
		switch (this.ch) {
			case '{':
				return object.call(this);
			case '[':
				return this.array();
			case '"':
			case '\'':
				return this.string();
			case '-':
				return this.number();
			default:
				return this.ch >= '0' && this.ch <= '9' ? this.number() : this.word();
		}
	};

	/**
	 * Returns the index of the current character.
	 *
	 * @private
	 * @returns {int} The current character's index.
	 */
	JSTokenizer.prototype.getIndex = function() {
		return this.at - 1;
	};

	JSTokenizer.prototype.getCh = function() {
		return this.ch;
	};

	JSTokenizer.prototype.init = function(sSource, iIndex) {
		this.text = sSource;
		this.at = iIndex || 0;
		this.ch = ' ';
	};

	/**
	 * Advances the index in the text to <code>iIndex</code>. Fails if the new index
	 * is smaller than the previous index.
	 *
	 * @private
	 * @param {int} iIndex - the new index
	 */
	JSTokenizer.prototype.setIndex = function(iIndex) {
		if (iIndex < this.at - 1) {
			throw new Error("Must not set index " + iIndex
				+ " before previous index " + (this.at - 1));
		}
		this.at = iIndex;
		this.next();
	};

	/**
	 * Return the parse function. It will have access to all of the above
	 * functions and variables.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @static
	 * @param {string} sSource The js source
	 * @param {int} iStart The start position
	 * @returns {object} the JavaScript object
	 */
	JSTokenizer.parseJS = function(sSource, iStart) {

		var oJSTokenizer = new JSTokenizer();
		var result;
		oJSTokenizer.init(sSource, iStart);
		result = oJSTokenizer.value();

		if ( isNaN(iStart) ) {
			oJSTokenizer.white();
			if (oJSTokenizer.getCh()) {
				oJSTokenizer.error("Syntax error");
			}
			return result;
		} else {
			return { result : result, at : oJSTokenizer.getIndex()};
		}

	};

	return JSTokenizer;
});
