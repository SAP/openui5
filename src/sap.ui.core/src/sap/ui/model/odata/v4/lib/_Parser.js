/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Parser
sap.ui.define([
], function () {
	"use strict";

	var // The delimiters in a system query option, possibly %-encoded (their hex value listed in
		// aMatches[1] if encoded)
		sDelimiters = "[=(),; \"']|%(20|22|27|28|29|2c|2C|3b|3B)",
		// A system query option
		sSystemQueryOption = "\\$\\w+",
		// ABNF rule oDataIdentifier
		sODataIdentifier = "[a-zA-Z_\\u0080-\\uFFFF][\\w\\u0080-\\uFFFF]*",
		// '*' (poss. %-encoded)
		sStar = "(?:\\*|%2[aA])",
		// A path consisting of simple identifiers separated by '/' or '.' optionally followed by
		// '.*', '/*', '/$ref' or '/$count'
		sNamedPath = sODataIdentifier + "(?:[./]" + sODataIdentifier + ")*"
			+ "(?:[./]" + sStar + "|/\\$ref|/\\$count)?",
		// '*' or '*/$ref'
		sStarPath = sStar + "(?:/\\$ref)?",
		// a path (ABNF rules expandPath, selectPath, ...)
		sPath = sNamedPath + "|" + sStarPath,
		// The pattern for a token with ID "VALUE"
		// All other characters in expressions (constants of type double/date/time/GUID), '/' as
		// part of rootExpr or implicitVariableExpr, '+' may be %-encoded
		sValue = '(?:[-+:./\\w"]|%2[bB])+',
		// A Token: either a delimiter or a path (listed in aMatches[2]), a value (listed in
		// aMatches[3]) or a system query option (listed in aMatches[4])
		rToken = new RegExp("^(?:" + sDelimiters + "|(" + sPath + ")|(" + sValue + ")|("
			+ sSystemQueryOption + "))"),
		// The two hex digits of a %-escape
		rEscapeDigits = /^[0-9a-f]{2}$/i,
		Parser;

	/**
	 * Throws an error that the token was not as expected.
	 *
	 * @param {string} sWhat A description what was expected
	 * @param {object} [oToken] The unexpected token or undefined to indicate end of input
	 * @param {string} sOption The complete option string
	 * @throws {SyntaxError} An error that the token was not as expected
	 */
	function expected(sWhat, oToken, sOption) {
		var sMessage = "Expected " + sWhat + " but instead saw ";

		if (oToken) {
			sMessage += "'" + oToken.value + "' at " + oToken.at;
		} else {
			sMessage += "end of input";
		}
		throw new SyntaxError(sMessage + ": " + sOption);
	}

	/**
	 * The function parses anything until the next ';' or ')' into a string. It counts the brackets;
	 * for each '(' a corresponding ')' must be found before the parse is finished. It does nothing
	 * to validate the given content.
	 *
	 * @param {object} oStartToken
	 *   The token at which the parsing started; its value will become the key in the result
	 * @param {object} oParser
	 *   The parser
	 * @returns {object}
	 *   An object with the value of the starting token as key and the parsed string as value.
	 */
	function parseAnythingWithBrackets(oStartToken, oParser) {
		var sValue = "",
			oResult = {},
			oToken;

		// recursive function that advances and adds to sValue until the matching closing
		// bracket has been consumed
		function brackets() {
			for (;;) {
				oToken = oParser.advance();
				if (!oToken || oToken.id === ';') {
					expected("')'", oToken, oParser.option);
				}
				sValue += oToken.value;
				if (oToken.id === ")") {
					return;
				}
				if (oToken.id === "(") {
					brackets();
				}
			}
		}

		oParser.advance("=");
		for (;;) {
			oToken = oParser.current();
			if (!oToken || oToken.id === ")" || oToken.id === ";") {
				break;
			}
			sValue += oParser.advance().value;
			if (oToken.id === "(") {
				brackets();
			}
		}
		if (!sValue) {
			expected("an option value", oToken, oParser.option);
		}
		oResult[oStartToken.value] = sValue;
		return oResult;
	}

	/**
	 * Parses a $expand option. Recursively calls systemQueryOption to parse embedded options.
	 *
	 * @param {object} oParser
	 *   The parser
	 * @returns {object}
	 *   An object with the described expand structure at the property $expand.
	 */
	function parseExpand(oParser) {
		var oExpand = {},
			sExpandPath,
			oQueryOption,
			sQueryOptionName,
			vValue;

		oParser.advance("=");
		do {
			vValue = null;
			sExpandPath = oParser.advance("PATH").value.replace(/%2a/i, "*");
			if (oParser.advanceIf("(")) {
				vValue = {};
				do {
					oQueryOption = oParser.systemQueryOption();
					sQueryOptionName = Object.keys(oQueryOption)[0];
					vValue[sQueryOptionName] = oQueryOption[sQueryOptionName];
				} while (oParser.advanceIf(";"));
				oParser.advance(")");
			}
			oExpand[sExpandPath] = vValue;
		} while (oParser.advanceIf(","));

		return {"$expand" : oExpand};
	}

	/**
	 * Parses a $select option.
	 *
	 * @param {object} oParser
	 *   The parser
	 * @returns {object}
	 *   An object with an array of select items at the property $select.
	 */
	function parseSelect(oParser) {
		var sPath,
			sPrefix,
			aSelect = [],
			oToken;

		oParser.advance("=");
		do {
			oToken = oParser.advance("PATH");
			sPath = oToken.value.replace(/%2a/i, "*");
			if (oParser.advanceIf("(")) {
				sPrefix = "(";
				do {
					sPath += sPrefix + oParser.advance("PATH").value;
					sPrefix = ",";
				} while (oParser.advanceIf(","));
				sPath += oParser.advance(")").value;
			}

			aSelect.push(sPath);
		} while (oParser.advanceIf(","));

		return {"$select" : aSelect};
	}

	/**
	 * Parses a system query option.
	 *
	 * @param {object[]} aTokens The tokens
	 * @param {string} sOption The option string (for error messages)
	 * @returns {object} The value for the part that has been parsed so far
	 * @throws {SyntaxError} If there is a syntax error
	 */
	function parse(aTokens, sOption) {
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
				if (sExpectedTokenId === "OPTION") {
					sExpectedTokenId = "system query option";
				} else if (sExpectedTokenId.length === 1) {
					sExpectedTokenId = "'" + sExpectedTokenId + "'";
				}
				expected(sExpectedTokenId, oToken, sOption);
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
		 * Returns the next token in the array of tokens, but does not advance the index.
		 * @returns {object} - the next token or undefined if all tokens have been read
		 */
		function current() {
			return aTokens[iCurrentToken];
		}

		/**
		 * Parses a system query option.
		 *
		 * @returns {object} A map with one system query option
		 * @throws {SyntaxError} If there is a syntax error
		 * @example
		 *   {"$expand" : {"SO_2_BP" : null}}
		 */
		function systemQueryOption() {
			var oParser = {
					advance : advance,
					advanceIf : advanceIf,
					current : current,
					systemQueryOption : systemQueryOption,
					option : sOption
				};

			oToken = advance('OPTION');
			switch (oToken.value) {
				case "$expand":
					return parseExpand(oParser);
				case "$select":
					return parseSelect(oParser);
				default:
					return parseAnythingWithBrackets(oToken, oParser);
			}
		}

		oResult = systemQueryOption();
		if (iCurrentToken < aTokens.length) {
			expected("end of input", aTokens[iCurrentToken], sOption);
		}
		return oResult;
	}

	/**
	 * Unescapes a %-encoded character.
	 *
	 * @param {string} sEscape The two hex digits from the escape string
	 * @returns {string} The unencoded character
	 */
	function unescape(sEscape) {
		return String.fromCharCode(parseInt(sEscape, 16));
	}

	/**
	 * Tokenizes a string starting and ending with a single quote (which may be %-encoded).
	 * A contained single quote is escaped by doubling it.
	 *
	 * @param {string} sNext The untokenized input starting with the opening quote
	 * @param {string} sOption The option string (for an error message)
	 * @param {number} iAt The position in the option string (for an error message)
	 * @returns {string} The unconverted string including the quotes.
	 */
	function tokenizeSingleQuotedString(sNext, sOption, iAt) {
		var i;

		function nextChar(bConsume) {
			var c = sNext[i];

			if (bConsume) {
				i += 1;
			}
			if (c === "%" && sNext[i] === "2" && sNext[i + 1] === "7") {
				c = "'";
				if (bConsume) {
					i += 2;
				}
			}
			return c;
		}

		for (i = 1; i < sNext.length; ) {
			if (nextChar(true) === "'") {
				if (nextChar(false) !== "'") {
					return sNext.slice(0, i);
				}
				nextChar(true); // consume 2nd quote
			}
		}
		throw new SyntaxError("Unterminated string at " + iAt + ": " + sOption);
	}

	/**
	 * Tokenizes a c-like string. It starts and ends with a double quote, backslash is the escape
	 * character. Both characters may be %-encoded.
	 *
	 * @param {string} sNext The untokenized input starting with the opening quote
	 * @param {string} sOption The option string (for an error message)
	 * @param {number} iAt The position in the option string (for an error message)
	 * @returns {string} The unconverted string including the quotes.
	 */
	function tokenizeDoubleQuotedString(sNext, sOption, iAt) {
		var c,
			sEscape,
			bEscaping = false,
			i;

		for (i = 1; i < sNext.length; i += 1) {
			if (bEscaping) {
				bEscaping = false;
			} else {
				c = sNext[i];
				if (c === "%") {
					sEscape = sNext.slice(i + 1, i + 3);
					if (rEscapeDigits.test(sEscape)) {
						c = unescape(sEscape);
						i += 2;
					}
				}
				if (c === '"') {
					return sNext.slice(0, i + 1);
				}
				bEscaping = c === '\\';
			}
		}
		throw new SyntaxError("Unterminated string at " + iAt + ": " + sOption);
	}

	/**
	 * Splits the option string into an array of tokens.
	 *
	 * @param {string} sOption The option string
	 * @returns {object[]} The array of tokens.
	 */
	function tokenize(sOption) {
		var iAt = 1, // The token's position for error messages; we count starting with 1
			sId,
			aMatches,
			sNext = sOption,
			oToken,
			aTokens = [],
			sValue;

		while (sNext.length) {
			aMatches = rToken.exec(sNext);
			if (aMatches) {
				sValue = aMatches[0];
				if (aMatches[4]) {
					sId = "OPTION";
				} else if (aMatches[3]) {
					sId = "VALUE";
				} else if (aMatches[2]) {
					sId = "PATH";
				} else if (aMatches[1]) {
					sId = unescape(aMatches[1]);
				} else {
					sId = aMatches[0];
				}
				if (sId === '"') {
					sId = "VALUE";
					sValue = tokenizeDoubleQuotedString(sNext, sOption, iAt);
				} else if (sId === "'") {
					sId = "VALUE";
					sValue = tokenizeSingleQuotedString(sNext, sOption, iAt);
				}
				oToken = {
					at : iAt,
					id : sId,
					value : sValue
				};
			} else {
				throw new SyntaxError("Unknown character '" + sNext[0] + "' at " + iAt + ": "
					+ sOption);
			}
			sNext = sNext.slice(sValue.length);
			iAt += sValue.length;
			aTokens.push(oToken);
		}

		return aTokens;
	}

	Parser = {
		/**
		 * Parses a system query option "$select" or "$expand" into an object representation.
		 *
		 * The value for "$select" is an array of strings.
		 *
		 * The value for "$expand" is an object with the path as key and the options as object. If
		 * there are no options, the value for the path is <code>null</code>. Each option again
		 * becomes a property with the option name as key and the option value as value.
		 *
		 * The value for all other options is simply the string passed to them.
		 *
		 * <b>Example:</b>
		 *
		 * <code>$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name);$select=*;$count=true;$orderby=Name desc)</code>
		 * is converted to
		 * <pre>
			{
				"$expand" : {
					"SO_2_BP" : null,
					"SO_2_SOITEM" : {
						"$count" : "true",
						"$expand" : {
							"SOITEM_2_PRODUCT" : {
								"$expand" : {
									"PRODUCT_2_BP" : null
								},
								"$select" : ["ID", "Name"]
							}
						},
						"$orderby" : "Name desc",
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
		parseSystemQueryOption : function (sOption) {
			return parse(tokenize(sOption), sOption);
		}
	};

	return Parser;
}, /* bExport= */false);
