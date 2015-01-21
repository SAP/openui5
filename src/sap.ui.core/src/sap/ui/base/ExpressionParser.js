/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

//TODO move to jquery.sap.script.js as jQuery.sap.tokenizerFactory
//-------------------------------------------------------------------------------------------------
	var fnTokenizerFactory = function() {
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
						return ch === "_" ||
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

		// Return the parse function. It will have access to all of the above
		// functions and variables.
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
			/**
			 * Returns the index of the current character.
			 * @returns {number} The current character's index.
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
			/**
			 * Advances the index in the text to <code>iIndex</code>. Fails if the new index
			 * is smaller than the previous index.
			 *
			 * @param {number} iIndex - the new index
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

//-------------------------------------------------------------------------------------------------

	//Formatter functions to evaluate symbols like literals or operators in the expression grammar
	/**
	 * Formatter function for an embedded binding.
	 * @param {number} i - the index of the binding as it appears when reading the
	 *   expression from the left
	 * @param {any[]} aParts - the array of binding values
	 * @returns {any} the binding value
	 */
	function BINDING(i, aParts) {
		return aParts[i];
	}

	/**
	 * Formatter function for the operator ===.
	 * @param {function} fnLeft - formatter function for the left operand
	 * @param {function} fnRight - formatter function for the right operand
	 * @param {any[]} aParts - the array of binding values
	 * @return {boolean} - whether the two operands are ===
	 */
	function EQ(fnLeft, fnRight, aParts) {
		return fnLeft(aParts) === fnRight(aParts);
	}

	/**
	 * Formatter function for a string literal.
	 * @param {string} s - the value of the string literal.
	 * @returns {string} the string literal
	 */
	function STRING(s) {
		return s;
	}

	/**
	 * Throws a SyntaxError with the given <code>sMessage</code> as <code>message</code>, its
	 * <code>at</code> property set to <code>iAt</code> and its <code>text</code> property to
	 * <code>sInput</code>.
	 * In addition, logs a corresponding error message to the console with <code>sInput</code>
	 * as details.
	 *
	 * @param {string} sMessage - the error message
	 * @param {string} sInput - the input string
	 * @param {number} [iAt] - the index in the input string where the error occurred
	 */
	function error(sMessage, sInput, iAt) {
		var oError = new SyntaxError(sMessage);

		oError.at = iAt;
		oError.text = sInput;
		if (iAt) {
			sMessage += " at " + iAt;
		}
		jQuery.sap.log.error(sMessage, sInput, "sap.ui.base.ExpressionParser");
		throw oError;
	}

	/**
	 * Computes the tokens according to the expression grammar in sInput starting at iStart and
	 * uses fnResolveBinding to resolve bindings embedded in the expression.
	 * @param {function} fnResolveBinding - the function to resolve embedded bindings
	 * @param {string} sInput - the string to be parsed
	 * @param {number} [iStart=0] - the index to start parsing
	 * @returns {object} Tokenization result object with the following properties
	 *   at: the index after the last character consumed by the tokenizer in the input string
	 *   parts: array with parts corresponding to resolved embedded bindings
	 *   tokens: the array of tokens where each token is a formatter function
	 */
	function tokenize(fnResolveBinding, sInput, iStart) {
		var aParts = [],
			aTokens = [],
			oTokenizer = fnTokenizerFactory();

		/**
		 * Consumes the next token in the input string and pushes it to the array of tokens.
		 * @returns {boolean} whether a token is recognized
		 */
		function consumeToken() {
			var ch,
				oBinding;

			oTokenizer.white();
			ch = oTokenizer.getCh();

			switch (ch) {
			case "'":  //string literal
			case '"':
				aTokens.push(jQuery.proxy(STRING, null, oTokenizer.string()));
				break;
			case "{": //binding
				oBinding = fnResolveBinding(sInput, oTokenizer.getIndex());
				aTokens.push(jQuery.proxy(BINDING, null, aParts.length));
				aParts.push(oBinding.result);
				oTokenizer.setIndex(oBinding.at); //go to first character after binding string
				break;
			case "=": // operator ===
				oTokenizer.next("=");
				oTokenizer.next("=");
				oTokenizer.next("=");
				aTokens.push(EQ);
				break;
			default: //unrecognized character: end of input
				return false;
			}
			return true;
		}

		oTokenizer.init(sInput, iStart);

		try {
			/* eslint-disable no-empty */
			while (consumeToken()) { /* deliberately empty */ }
			/* eslint-enable no-empty */
		} catch (e) {
			if (e.name === "SyntaxError") { //handle tokenizer errors
				error(e.message, e.text, e.at);
			} else {
				throw e;
			}
		}

		return {
			at: oTokenizer.getIndex(),
			parts: aParts,
			tokens: aTokens
		};
	}

	/**
	 * Parses expression tokens to a result object as specified to be returned by
	 * {@link sap.ui.base.ExpressionParser#parse}.
	 * @param {object} oTokens
	 *   the object with the tokens, parts and the index being the result of the tokenize
	 *   function
	 * @returns {object} the parse result object; undefined in case of an invalid expression
	 */
	function parse(oTokens) {
		var fnExpressionFormatter,
			aSymbols = oTokens.tokens; //start with terminal symbols = tokens from tokenizer

		//TODO Handle invalid expression with Error, console error output:
		//a) parser errors
		//b) For the case iStart is set check the symbol array:
		//   If it contains <expression> as lowest entry the parsing is successful.
		//   In case of further symbols above it, return the start index of the first of
		//     these as "at".
		if (aSymbols.length === 1) {
			fnExpressionFormatter = aSymbols[0];
		} else if (aSymbols.length === 3 && aSymbols[1] === EQ) {
			fnExpressionFormatter =  jQuery.proxy(EQ, null, aSymbols[0], aSymbols[2]);
		}
		if (fnExpressionFormatter) {
			return {
				result: {
					formatter: function() {
						//make separate parameters for parts one (array like) parameter
						return fnExpressionFormatter(arguments);
					},
					parts: oTokens.parts
					//TODO useRawValues: true --> use JS object instead of formatted String
				},
				at: oTokens.at
			};
		}
	}

	/**
	 * The parser to parse expressions in bindings.
	 *
	 * @alias sap.ui.base.ExpressionParser
	 * @private
	 */
	return {
		/**
		 * Parses a string <code>sInput</code> with an expression based on the syntax sketched
		 * below.
		 *
		 * If a start index <code>iStart</code> for parsing is provided, the input string is parsed
		 * starting from this index and the return value contains the index after the last
		 * character belonging to the expression.
		 *
		 * If <code>iStart</code> is undefined the complete string is parsed; in this case
		 * a <code>SyntaxError</code> is thrown if it does not comply to the expression syntax.
		 *
		 * The expression syntax is a subset of JavaScript expression syntax with the
		 * enhancement that the only "variable" parts in an expression are bindings enclosed in
		 * curly braces.
		 *
		 * Supported expression grammar subset:
		 * expression ::= string | binding
		 * expression ::= expression binary_operator expression
		 * expression ::= white expression white
		 * binary_operator ::= '==='
		 * # substring with '{' prefix is resolved by fnResolveBinding
		 * binding ::= '{'...
		 * # substring with ' or " prefix is resolved by the "string" function in the tokenizer
		 * string ::= '... | "...
		 * # whitespace is resolved by the "white" function in the tokenizer
		 * white ::= ...
		 *
		 * @param {function} fnResolveBinding - the function to resolve embedded bindings
		 * @param {string} sInput - the string to be parsed
		 * @param {number} [iStart=0] - the index to start parsing
		 * @returns {object} the parse result with the following properties
		 *   result: object with the properties
		 *     formatter: the formatter function to evaluate the expression which
		 *       takes the parts corresponding to bindings embedded in the expression as
		 *       parameters
		 *     parts: the array of parts contained in the expression string which is
		 *       empty if no parts exist
		 *   at: the index of the first character after the expression in sInput
		 * @throws SyntaxError
		 *   If the expression string is invalid or unsupported. The at property of
		 *   the error contains the index where parsing failed.
		 */
		parse: function (fnResolveBinding, sInput, iStart) {
			var oTokens = tokenize(fnResolveBinding, sInput, iStart),
				oResult = parse(oTokens);

			if (!oResult) {
				//TODO proper error handling in parser (at, ...)
				error("Invalid expression", sInput);
			}
			if (!iStart && oResult.at < sInput.length) {
				error("Invalid token in expression", sInput, oTokens.at);
			}
			return oResult;
		},

		//TODO make this @private part of jquery.sap.script.js as e.g. jQuery.sap.tokenizerFactory
		/**
		 * A factory returning a tokenizer object for JS values.
		 * Contains functions to consume tokens on an input string.
		 * @private
		 */
		tokenizerFactory: fnTokenizerFactory
	};
}, /* bExport= */ true);
