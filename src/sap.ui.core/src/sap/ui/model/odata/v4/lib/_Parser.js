/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Parser
sap.ui.define([
], function () {
	"use strict";

	var mSymbols,
		// either one of "=(),;*" or "$expand" or "$select" or a path (which will be listed in
		// aMatches[1])
		// skip path validation to keep it simple
		rToken = /^(?:[=(),;*]|\$expand|\$select|([a-zA-Z_\u0080-\uFFFF][/\w\u0080-\uFFFF]*))/,
		Parser;

	mSymbols = { //symbol table
		"$expand" : {
			nud : function (oToken, oParser) {
				var oExpand = {},
					sExpandPath,
					oQueryOption,
					sQueryOptionName,
					vValue;

				oParser.advance("=");
				do {
					vValue = null;
					sExpandPath = oParser.advance("PATH").value;
					if (oParser.advanceIf("(")) {
						vValue = {};
						do {
							oQueryOption = oParser.systemQueryOption(0);
							sQueryOptionName = Object.keys(oQueryOption)[0];
							vValue[sQueryOptionName] = oQueryOption[sQueryOptionName];
						} while (oParser.advanceIf(";"));
						oParser.advance(")");
					}
					oExpand[sExpandPath] = vValue;
				} while (oParser.advanceIf(","));

				return {"$expand" : oExpand};
			}
		},
		"$select" : {
			nud : function (oToken, oParser) {
				var aSelect = [];

				oParser.advance("=");
				if (oParser.advanceIf("*")) {
					return {"$select" : ["*"]};
				}
				do {
					aSelect.push(oParser.advance("PATH").value);
				} while (oParser.advanceIf(","));

				return {"$select" : aSelect};
			}
		},
		"PATH" : {
			nud : expectOption
		},
		"*" : {
			nud : expectOption
		},
		"=" : {
			nud : expectOption
		},
		"," : {
			nud : expectOption
		},
		";" : {
			nud : expectOption
		},
		"(" : {
			nud : expectOption
		},
		")" : {
			nud : expectOption
		}
	};

	/**
	 * Throws an error that the token was not as expected.
	 *
	 * @param {string} sWhat A description what was expected
	 * @param {object} [oToken] The unexpected token or undefined to indicate end of input
	 * @throws {SyntaxError} An error that the token was not as expected
	 */
	function expected(sWhat, oToken) {
		if (!oToken) {
			throw new SyntaxError("Expected " + sWhat + " but instead saw end of input");
		}
		throw new SyntaxError("Expected " + sWhat + " but instead saw '" + oToken.value + "' at "
			+ oToken.at);
	}

	/**
	 * Throws an error for the unexpected token oToken.
	 *
	 * @param {object} oToken The unexpected token
	 * @throws {SyntaxError} An error for the unexpected token oToken
	 */
	function expectOption(oToken) {
		expected("option", oToken);
	}

	/**
	 * Parses the system query options.
	 *
	 * @param {object[]} aTokens The tokens
	 * @returns {object} The value for the part that has been parsed so far
	 * @throws {SyntaxError} If there is a syntax error
	 */
	function parse(aTokens) {
		var iCurrentToken = 0,
			oResult,
			oToken;

		/**
		 * Returns the next token in the array of tokens and advances the index in this array.
		 *
		 * @param {string} [sExpectedTokenId] The expected ID of the next token or undefined to
		 *   accept any token
		 * @returns {object} The next token or undefined if all tokens have been read
		 * @throws {SyntaxError} If the next token's ID is not as expected
		 */
		function advance(sExpectedTokenId) {
			var oToken = aTokens[iCurrentToken];

			if (sExpectedTokenId && (!oToken || oToken.id !== sExpectedTokenId)) {
				expected("'" + sExpectedTokenId + "'", oToken);
			}
			iCurrentToken += 1;
			return oToken;
		}

		/**
		 * Advances the index in in the array of tokens if this token has the expected ID.
		 *
		 * @param {string} sExpectedTokenId The expected id of the next token
		 * @returns {boolean} True if the token is as expected and the parser has advanced
		 */
		function advanceIf(sExpectedTokenId) {
			var oToken = aTokens[iCurrentToken];

			if (oToken && oToken.id === sExpectedTokenId) {
				iCurrentToken += 1;
				return true;
			}
			return false;
		}

		/**
		 * Parses a system query option.
		 *
		 * @param {number} rbp The right binding power (currently unused)
		 * @returns {object} A map with one system query option
		 * @throws {SyntaxError} If there is a syntax error
		 * @example
		 *   {"$expand" : {"SO_2_BP" : null}}
		 */
		function systemQueryOption(rbp) {
			var oLeft,
				oParser = {
					advance : advance,
					advanceIf : advanceIf,
					systemQueryOption : systemQueryOption
				};

			oToken = advance();
			if (!oToken) {
				throw new SyntaxError("Expected option but instead saw end of input");
			}
			oLeft = mSymbols[oToken.id].nud(oToken, oParser);

			//this part of the original TDOP parser algorithm is not needed
			//comment out for 100% code coverage by unit tests
//			while (iCurrentToken < aTokens.length) {
//				oToken = current();
//				if (rbp >= (mSymbols[oToken.id].lbp || 0)) {
//					break;
//				}
//				advance();
//				oLeft = mSymbols[oToken.id].led(oToken, oLeft, oParser);
//			}

			return oLeft;
		}

		oResult = systemQueryOption(0);
		if (iCurrentToken < aTokens.length) {
			expected("end of input", aTokens[iCurrentToken]);
		}
		return oResult;
	}

	/**
	 * Splits the option string into an array of tokens.
	 *
	 * @param {string} sOption The option string
	 * @returns {object[]} The array of tokens.
	 */
	function tokenize(sOption) {
		var iAt = 0,
			aMatches,
			oToken,
			aTokens = [];

		while (sOption.length) {
			aMatches = rToken.exec(sOption);
			if (aMatches) {
				oToken = {
					at : iAt,
					id : aMatches[1] ? "PATH" : aMatches[0],
					value : aMatches[0]
				};
			} else {
				throw new SyntaxError("Unknown character '" + sOption[0] + "' at " + iAt);
			}
			sOption = sOption.slice(aMatches[0].length);
			iAt += aMatches[0].length;
			aTokens.push(oToken);
		}

		return aTokens;
	}

	Parser = {
		/**
		 * Parses a system query option into an object representation. Only the options "$expand"
		 * and "$select" are supported.
		 *
		 * The value for "$select" is an array of strings.
		 *
		 * The value for "$expand" is an object with the path as key and the options as object. If
		 * there are no options, the value for the path is <code>null</code>. Each option again
		 * becomes a property with the option name as key and the option value as value.
		 *
		 * <b>Example:</b>
		 *
		 * <code>$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name);$select=*)</code>
		 * is converted to
		 * <pre>
			{
				"$expand" : {
					"SO_2_BP" : null,
					"SO_2_SOITEM" : {
						"$expand" : {
							"SOITEM_2_PRODUCT" : {
								"$expand" : {
									"PRODUCT_2_BP" : null
								},
								"$select" : ["ID", "Name"]
							}
						},
						"$select" : ["*"]
					}
				}
			}
		 * </pre>
		 *
		 * @param {string} sOption The option string
		 * @returns {object} The option value as object
		 * @throws {SyntaxError} If the string could not be parsed
		 */
		parseSystemQueryOption : function(sOption) {
			return parse(tokenize(sOption));
		}
	};

	return Parser;
}, /* bExport= */false);
