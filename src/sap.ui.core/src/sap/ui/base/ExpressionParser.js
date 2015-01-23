/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	//SAP's Independent Implementation of "Top Down Operator Precedence" by Vaughan R. Pratt,
	//    see http://portal.acm.org/citation.cfm?id=512931
	//Inspired by "TDOP" of Douglas Crockford which is also an implementation of Pratt's article
	//    see https://github.com/douglascrockford/TDOP
	//License granted by Douglas Crockford to SAP, Apache License 2.0
	//    (http://www.apache.org/licenses/LICENSE-2.0)
	//
	//led = "left denotation"
	//lbp = "left binding power", for values see
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
	//nud = "null denotation"
	//rbp = "right binding power"
	var mSymbols = {
			"BINDING": {
				//TODO lbp
				led: function (fnLeft, oToken, fnExpression) {
					error("Unexpected binding: " + oToken.source);
				},
				nud: function (oToken) {
					return jQuery.proxy(BINDING, null, oToken.value);
				}
			},
			"LITERAL": {
				//TODO lbp
				led: function (fnLeft, oToken, fnExpression) {
					error("Unexpected literal: " + oToken.value);
				},
				nud: function (oToken) {
					return jQuery.proxy(LITERAL, null, oToken.value);
				}
			},
			"===": {
				//TODO nud --> error
				//TODO lbp
				led: function (fnLeft, oToken, fnExpression) {
					return jQuery.proxy(EQ, null, fnLeft, fnExpression());
				}
			},
			"||": {
				//TODO nud --> error
				lbp: 6,
				led: function (fnLeft, oToken, fnExpression) {
					return jQuery.proxy(OR, null, fnLeft, fnExpression(/*rbp*/6));
				}
			},
			"&&": {
				//TODO nud --> error
				lbp: 7,
				led: function (fnLeft, oToken, fnExpression) {
					return jQuery.proxy(AND, null, fnLeft, fnExpression(/*rbp*/7));
				}
			}
	};

	//Formatter functions to evaluate symbols like literals or operators in the expression grammar
	/**
	 * Formatter function for the operator &&.
	 * @param {function} fnLeft - formatter function for the left operand
	 * @param {function} fnRight - formatter function for the right operand
	 * @param {any[]} aParts - the array of binding values
	 * @return {any} - the result of && applied to the two operands
	 */
	function AND(fnLeft, fnRight, aParts) {
		return fnLeft(aParts) && fnRight(aParts);
	}

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
	 * Formatter function for any literal.
	 * @param {any} v - any literal value
	 * @returns {any} any literal
	 */
	function LITERAL(v) {
		return v;
	}

	/**
	 * Formatter function for the operator ||.
	 * @param {function} fnLeft - formatter function for the left operand
	 * @param {function} fnRight - formatter function for the right operand
	 * @param {any[]} aParts - the array of binding values
	 * @return {any} - the result of || applied to the two operands
	 */
	function OR(fnLeft, fnRight, aParts) {
		return fnLeft(aParts) || fnRight(aParts);
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
	 *   tokens: the array of tokens where each token is a tuple of ID, optional value, and
	 *   optional source text
	 */
	function tokenize(fnResolveBinding, sInput, iStart) {
		var aParts = [],
			aTokens = [],
			oTokenizer = jQuery.sap._createJSTokenizer();

		/**
		 * Consumes the next token in the input string and pushes it to the array of tokens.
		 * @returns {boolean} whether a token is recognized
		 */
		function consumeToken() {
			var ch, oBinding, iStart;

			oTokenizer.white();
			ch = oTokenizer.getCh();

			switch (ch) {
			case "'":  //string literal
			case '"':
				aTokens.push({id: "LITERAL", value: oTokenizer.string()}); //TODO source
				break;
			case "$":
				iStart = oTokenizer.getIndex();
				oTokenizer.next("$");
				oTokenizer.next("{"); //binding
				oBinding = fnResolveBinding(sInput, oTokenizer.getIndex() - 1);
				aTokens.push({
					id: "BINDING",
					source: sInput.slice(iStart, oBinding.at),
					value: aParts.length
				});
				aParts.push(oBinding.result);
				oTokenizer.setIndex(oBinding.at); //go to first character after binding string
				break;
			case "=": //operator ===
				oTokenizer.next("=");
				oTokenizer.next("=");
				oTokenizer.next("=");
				aTokens.push({id: "==="});
				break;
			case 'f': //false
			case 'n': //null
			case 't': //true
				aTokens.push({id: "LITERAL", value: oTokenizer.word()});
				break;
			case "|": //operator ||
				oTokenizer.next("|");
				oTokenizer.next("|");
				aTokens.push({id: "||"});
				break;
			case "&": //operator &&
				oTokenizer.next("&");
				oTokenizer.next("&");
				aTokens.push({id: "&&"});
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
	 * @param {object[]} aTokens
	 *   the array with the tokens
	 * @returns {function} the formatter function to evaluate the expression which takes the parts
	 *   corresponding to bindings embedded in the expression as a single array; undefined in case
	 *   of an invalid expression
	 */
	function parse(aTokens) {
		var iNextToken = 0,
			oToken;

		/**
		 * Parse an expression starting at the current token.
		 *
		 * @param {number} rbp
		 *   a "right binding power"
		 * @returns {function}
		 */
		function expression(rbp) {
			var fnLeft;

			oToken = aTokens[iNextToken];
			iNextToken += 1;
			fnLeft = mSymbols[oToken.id].nud(oToken);

			while (iNextToken < aTokens.length) {
				oToken = aTokens[iNextToken];
				if (rbp >= mSymbols[oToken.id].lbp) {
					break;
				}
				iNextToken += 1;
				fnLeft = mSymbols[oToken.id].led(fnLeft, oToken, expression);
			}

			return fnLeft;
		}

		//TODO allow short read by passing 0 (do it if iStart is provided below)
		return expression(-1); // -1 = "greedy read"
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
				fnExpressionFormatter = parse(oTokens.tokens);

			if (!fnExpressionFormatter) {
				//TODO proper error handling in parser (at, ...)
				error("Invalid expression", sInput);
			}
			if (!iStart && oTokens.at < sInput.length) {
				error("Invalid token in expression", sInput, oTokens.at);
			}
			return {
				result: {
					//FIXME must not return formatter but constant value if there are no parts
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
	};
}, /* bExport= */ true);
