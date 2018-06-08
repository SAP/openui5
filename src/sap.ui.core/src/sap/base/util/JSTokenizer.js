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
	 * Git URL: https://github.com/douglascrockford/JSON-js/blob/42c18c621a411c3f39a81bb0a387fc50dcd738d9/json_parse.js
	 */

	/**
	 * A factory returning a tokenizer object for JS values.
	 *
	 * Contains functions to consume tokens on an input string.
	 * @exports sap/base/util/JSTokenizer
	 * @private
	 * @returns {object} - the tokenizer
	 */
	var fnJSTokenizer = function() {
		var at, // The index of the current character
			ch, // The current character
			escapee = {
				'"': '"',
				'\'': '\'',
				'\\': '\\',
				'/': '/',
				b: '\b',
				f: '\f',
				n: '\n',
				r: '\r',
				t: '\t'
			},
			text,

			error = function(m) {

				// Call error when something is wrong.
				throw {
					name: 'SyntaxError',
					message: m,
					at: at,
					text: text
				};
			},

			next = function(c) {

				// If a c parameter is provided, verify that it matches the current character.
				if (c && c !== ch) {
					error("Expected '" + c + "' instead of '" + ch + "'");
				}

				// Get the next character. When there are no more characters,
				// return the empty string.
				ch = text.charAt(at);
				at += 1;
				return ch;
			},

			number = function() {

				// Parse a number value.
				var number, string = '';

				if (ch === '-') {
					string = '-';
					next('-');
				}
				while (ch >= '0' && ch <= '9') {
					string += ch;
					next();
				}
				if (ch === '.') {
					string += '.';
					while (next() && ch >= '0' && ch <= '9') {
						string += ch;
					}
				}
				if (ch === 'e' || ch === 'E') {
					string += ch;
					next();
					if (ch === '-' || ch === '+') {
						string += ch;
						next();
					}
					while (ch >= '0' && ch <= '9') {
						string += ch;
						next();
					}
				}
				number = +string;
				if (!isFinite(number)) {
					error("Bad number");
				} else {
					return number;
				}
			},

			string = function() {

				// Parse a string value.
				var hex, i, string = '', quote,
					uffff;

				// When parsing for string values, we must look for " and \ characters.
				if (ch === '"' || ch === '\'') {
					quote = ch;
					while (next()) {
						if (ch === quote) {
							next();
							return string;
						}
						if (ch === '\\') {
							next();
							if (ch === 'u') {
								uffff = 0;
								for (i = 0; i < 4; i += 1) {
									hex = parseInt(next(), 16);
									if (!isFinite(hex)) {
										break;
									}
									uffff = uffff * 16 + hex;
								}
								string += String.fromCharCode(uffff);
							} else if (typeof escapee[ch] === 'string') {
								string += escapee[ch];
							} else {
								break;
							}
						} else {
							string += ch;
						}
					}
				}
				error("Bad string");
			},

			name = function() {

				// Parse a name value.
				var name = '',
					allowed = function(ch) {
						return ch === "_" || ch === "$" ||
							(ch >= "0" && ch <= "9") ||
							(ch >= "a" && ch <= "z") ||
							(ch >= "A" && ch <= "Z");
					};

				if (allowed(ch)) {
					name += ch;
				} else {
					error("Bad name");
				}

				while (next()) {
					if (ch === ' ') {
						next();
						return name;
					}
					if (ch === ':') {
						return name;
					}
					if (allowed(ch)) {
						name += ch;
					} else {
						error("Bad name");
					}
				}
				error("Bad name");
			},

			white = function() {

				// Skip whitespace.
				while (ch && ch <= ' ') {
					next();
				}
			},

			word = function() {

				// true, false, or null.
				switch (ch) {
				case 't':
					next('t');
					next('r');
					next('u');
					next('e');
					return true;
				case 'f':
					next('f');
					next('a');
					next('l');
					next('s');
					next('e');
					return false;
				case 'n':
					next('n');
					next('u');
					next('l');
					next('l');
					return null;
				}
				error("Unexpected '" + ch + "'");
			},

			value, // Place holder for the value function.
			array = function() {

				// Parse an array value.
				var array = [];

				if (ch === '[') {
					next('[');
					white();
					if (ch === ']') {
						next(']');
						return array; // empty array
					}
					while (ch) {
						array.push(value());
						white();
						if (ch === ']') {
							next(']');
							return array;
						}
						next(',');
						white();
					}
				}
				error("Bad array");
			},

			object = function() {

				// Parse an object value.
				var key, object = {};

				if (ch === '{') {
					next('{');
					white();
					if (ch === '}') {
						next('}');
						return object; // empty object
					}
					while (ch) {
						if (ch >= "0" && ch <= "9") {
							key = number();
						} else if (ch === '"' || ch === '\'') {
							key = string();
						} else {
							key = name();
						}
						white();
						next(':');
						if (Object.hasOwnProperty.call(object, key)) {
							error('Duplicate key "' + key + '"');
						}
						object[key] = value();
						white();
						if (ch === '}') {
							next('}');
							return object;
						}
						next(',');
						white();
					}
				}
				error("Bad object");
			};

		value = function() {

			// Parse a JS value. It could be an object, an array, a string, a number,
			// or a word.
			white();
			switch (ch) {
			case '{':
				return object();
			case '[':
				return array();
			case '"':
			case '\'':
				return string();
			case '-':
				return number();
			default:
				return ch >= '0' && ch <= '9' ? number() : word();
			}
		};

		/**
		 * Return the parse function. It will have access to all of the above
		 * functions and variables.
		 *
		 * @param {string} source - The js source
		 * @param {integer} start - The start position
		 */
		function parseJS(source, start) {
			var result;

			text = source;
			at = start || 0;
			ch = ' ';
			result = value();

			if ( isNaN(start) ) {
				white();
				if (ch) {
					error("Syntax error");
				}
				return result;
			} else {
				return { result : result, at : at - 1 };
			}

		}

		return {
			array: array,
			error: error,
			/*
			 * Returns the index of the current character.
			 * @returns {int} The current character's index.
			 */
			getIndex: function() {
				return at - 1;
			},
			getCh: function() {
				return ch;
			},
			init: function(source, iIndex) {
				text = source;
				at = iIndex || 0;
				ch = ' ';
			},
			name: name,
			next: next,
			number: number,
			parseJS: parseJS,
			/*
			 * Advances the index in the text to <code>iIndex</code>. Fails if the new index
			 * is smaller than the previous index.
			 *
			 * @param {int} iIndex - the new index
			 */
			setIndex: function(iIndex) {
				if (iIndex < at - 1) {
					throw new Error("Must not set index " + iIndex
						+ " before previous index " + (at - 1));
				}
				at = iIndex;
				next();
			},
			string: string,
			value: value,
			white: white,
			word: word
		};
	};
	return fnJSTokenizer;
});
