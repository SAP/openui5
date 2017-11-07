/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Parser
sap.ui.define([
], function () {
	"use strict";

	var // The delimiters in a system query option, possibly %-encoded (their hex value listed in
		// aMatches[3] if encoded)
		sDelimiters = "[=(),; \"']|%(20|22|27|28|29|2c|2C|3b|3B)",
		// A system query option
		sSystemQueryOption = "\\$\\w+",
		// ABNF rule oDataIdentifier
		sODataIdentifier = "[a-zA-Z_\\u0080-\\uFFFF][\\w\\u0080-\\uFFFF]*",
		// "required white space" (but only one char)
		sRws = "(?:[ \\t]|%09|%20)",
		// "required white space"
		rRws = new RegExp(sRws + "+", "g"),
		// OData operators (only recognized when surrounded by spaces; aMatches[1] contains the
		// leading spaces, aMatches[2] the operator if found)
		sOperators = "(" + sRws + "+)(eq|ge|gt|le|lt|ne)" + sRws + "*",
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
		// A Token: either an operator, a delimiter, a path (in aMatches[4]), a value (in
		// aMatches[5]) or a system query option (in aMatches[6])
		rToken = new RegExp("^(?:" + sOperators +  "|" + sDelimiters + "|(" + sPath + ")|("
			+ sValue + ")|(" + sSystemQueryOption + "))"),
		// The two hex digits of a %-escape
		rEscapeDigits = /^[0-9a-f]{2}$/i,
		// The symbol table for the filter parser
		mFilterParserSymbols = {};

	/**
	 * Adds an infix operator to mFilterParserSymbols.
	 *
	 * @param {string} sId The token ID
	 * @param {number} iLbp The "left binding power"
	 */
	function addInfixOperator(sId, iLbp) {
		mFilterParserSymbols[sId] = {
			lbp : iLbp,
			led : function (oToken, oLeft) {
				oToken.left = oLeft;
				oToken.right = this.expression(iLbp);
				return oToken;
			}
		};
	}

	/**
	 * Adds a leaf symbol to mFilterParserSymbols.
	 *
	 * @param {string} sId The token ID
	 */
	function addLeafSymbol(sId) {
		mFilterParserSymbols[sId] = {
			lbp : 0,
			nud : function (oToken) {
				return oToken;
			}
		};
	}

	addLeafSymbol("PATH");
	addLeafSymbol("VALUE");
	addInfixOperator("eq", 1);
	addInfixOperator("ge", 1);
	addInfixOperator("gt", 1);
	addInfixOperator("le", 1);
	addInfixOperator("lt", 1);
	addInfixOperator("ne", 1);

	/**
	 * The base class for the system query option parser and the filter parser. Takes care of token
	 * and error handling.
	 */
	function Parser() {
	}

	/**
	 * Returns the current token and advances to the next one.
	 *
	 * @param {string} [sExpectedTokenId] The expected ID of the token or undefined to accept any
	 *   token
	 * @returns {object} The current token or undefined if all tokens have been read
	 * @throws {SyntaxError} If the next token's ID is not as expected
	 */
	Parser.prototype.advance = function (sExpectedTokenId) {
		var oToken = this.current();

		if (sExpectedTokenId && (!oToken || oToken.id !== sExpectedTokenId)) {
			if (sExpectedTokenId === "OPTION") {
				sExpectedTokenId = "system query option";
			} else if (sExpectedTokenId.length === 1) {
				sExpectedTokenId = "'" + sExpectedTokenId + "'";
			}
			this.expected(sExpectedTokenId, oToken);
		}
		this.iCurrentToken += 1;
		return oToken;
	};

	/**
	 * Advances to the next token if the current token has the expected ID.
	 *
	 * @param {string} sExpectedTokenId The expected id of the next token
	 * @returns {boolean} True if the token is as expected and the parser has advanced
	 */
	Parser.prototype.advanceIf = function (sExpectedTokenId) {
		var oToken = this.current();

		if (oToken && oToken.id === sExpectedTokenId) {
			this.iCurrentToken += 1;
			return true;
		}
		return false;
	};

	/**
	 * Returns the current token in the array of tokens, but does not advance.
	 * @returns {object} - the current token or undefined if all tokens have been read
	 */
	Parser.prototype.current = function () {
		return this.aTokens[this.iCurrentToken];
	};

	/**
	 * Throws an error.
	 *
	 * @param {string} sMessage The error message
	 * @param {object} [oToken] The token to report the error for or undefined to indicate end of
	 *   input
	 * @throws {SyntaxError} With this error message
	 */
	Parser.prototype.error = function (sMessage, oToken) {
		var sValue;

		if (oToken) {
			sValue = oToken.value;
			sMessage += "'" + (sValue === " " ?  sValue : sValue.replace(rRws, "")) + "' at "
				+ oToken.at;
		} else {
			sMessage += "end of input";
		}
		throw new SyntaxError(sMessage + ": " + this.sText);
	};

	/**
	 * Throws an error that the token was not as expected.
	 *
	 * @param {string} sWhat A description what was expected
	 * @param {object} [oToken] The unexpected token or undefined to indicate end of input
	 * @throws {SyntaxError} An error that the token was not as expected
	 */
	Parser.prototype.expected = function (sWhat, oToken) {
		this.error("Expected " + sWhat + " but instead saw ", oToken);
	};

	/**
	 * Checks that all tokens have been consumed and returns the result.
	 *
	 * @param {object} oResult The result to return
	 * @returns {object} The result
	 * @throws {SyntaxError} If there are unconsumed tokens
	 */
	Parser.prototype.finish = function (oResult) {
		if (this.iCurrentToken < this.aTokens.length) {
			this.expected("end of input", this.aTokens[this.iCurrentToken]);
		}
		return oResult;
	};

	/**
	 * Initializes the Parser for the parse.
	 *
	 * @param {string} sText The text to parse
	 */
	Parser.prototype.init = function (sText) {
		this.sText = sText;
		this.aTokens = tokenize(sText);
		this.iCurrentToken = 0;
	};

	/**
	 * A parser that is able to parse a filter string into a syntax tree which recognizes paths,
	 * comparison operators and literals.
	 */
	function FilterParser() {
	}

	FilterParser.prototype = Object.create(Parser.prototype);

	/**
	 * Parses a filter expression starting at the current token.
	 *
	 * @returns {object} The syntax tree for that expression
	 */
	FilterParser.prototype.expression = function () {
		var oLeft, oToken;

		oToken = this.advance();
		if (!oToken) {
			this.expected("expression");
		}
		oLeft = this.getSymbolValue(oToken, "nud").call(this, oToken);
		oToken = this.current();
		if (oToken) {
			oLeft = this.getSymbolValue(oToken, "led").call(this, this.advance(), oLeft);
		}
		return oLeft;
	};

	/**
	 * Returns a value from the symbol table entry for the token.
	 *
	 * @param {object} oToken The token
	 * @param {string} sWhat The key in the symbol table entry
	 * @returns {any} The value
	 * @throws {SyntaxError} An error that the token was unexpected when there is no such value
	 */
	FilterParser.prototype.getSymbolValue = function (oToken, sWhat) {
		var oSymbol = mFilterParserSymbols[oToken.id];

		if (!oSymbol || !(sWhat in oSymbol)) {
			this.error("Unexpected ", oToken);
		}
		return oSymbol[sWhat];
	};

	/**
	 * Parses a filter string.
	 *
	 * @param {string} sFilter The filter string
	 * @returns {object} The syntax tree for the filter
	 * @throws {SyntaxError} If there is a syntax error
	 */
	FilterParser.prototype.parse = function (sFilter) {
		this.init(sFilter);
		return this.finish(this.expression());
	};

	/**
	 * A parser that is able to parse system query strings. It focuses on $select and $expand, all
	 * other options remain strings, even when embedded into an expand statement.
	 */
	function SystemQueryOptionParser () {
	}

	SystemQueryOptionParser.prototype = Object.create(Parser.prototype);

	/**
	 * Parses a system query option string.
	 *
	 * @param {string} sOption The option string (for error messages)
	 * @returns {object} The object representation
	 * @throws {SyntaxError} If there is a syntax error
	 */
	SystemQueryOptionParser.prototype.parse = function (sOption) {
		this.init(sOption);
		return this.finish(this.parseSystemQueryOption());
	};

	/**
	 * The function parses anything until the next ';' or ')' into a string. It counts the brackets;
	 * for each '(' a corresponding ')' must be found before the parse is finished. It does nothing
	 * to validate the given content.
	 *
	 * @param {object} oStartToken
	 *   The token at which the parsing started; its value will become the key in the result
	 * @returns {object}
	 *   An object with the value of the starting token as key and the parsed string as value.
	 */
	SystemQueryOptionParser.prototype.parseAnythingWithBrackets = function (oStartToken) {
		var sValue = "",
			oResult = {},
			oToken,
			that = this;

		// recursive function that advances and adds to sValue until the matching closing
		// bracket has been consumed
		function brackets() {
			for (;;) {
				oToken = that.advance();
				if (!oToken || oToken.id === ';') {
					that.expected("')'", oToken);
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

		this.advance("=");
		for (;;) {
			oToken = this.current();
			if (!oToken || oToken.id === ")" || oToken.id === ";") {
				break;
			}
			sValue += this.advance().value;
			if (oToken.id === "(") {
				brackets();
			}
		}
		if (!sValue) {
			this.expected("an option value", oToken);
		}
		oResult[oStartToken.value] = sValue;
		return oResult;
	};

	/**
	 * Parses a $expand option. Recursively calls parseSystemQueryOption to parse embedded options.
	 *
	 * @returns {object}
	 *   An object with the described expand structure at the property $expand.
	 */
	SystemQueryOptionParser.prototype.parseExpand = function () {
		var oExpand = {},
			sExpandPath,
			oQueryOption,
			sQueryOptionName,
			vValue;

		this.advance("=");
		do {
			vValue = null;
			sExpandPath = this.advance("PATH").value.replace(/%2a/i, "*");
			if (this.advanceIf("(")) {
				vValue = {};
				do {
					oQueryOption = this.parseSystemQueryOption();
					sQueryOptionName = Object.keys(oQueryOption)[0];
					vValue[sQueryOptionName] = oQueryOption[sQueryOptionName];
				} while (this.advanceIf(";"));
				this.advance(")");
			}
			oExpand[sExpandPath] = vValue;
		} while (this.advanceIf(","));

		return {"$expand" : oExpand};
	};

	/**
	 * Parses a $select option.
	 *
	 * @returns {object}
	 *   An object with an array of select items at the property $select.
	 */
	SystemQueryOptionParser.prototype.parseSelect = function () {
		var sPath,
			sPrefix,
			aSelect = [],
			oToken;

		this.advance("=");
		do {
			oToken = this.advance("PATH");
			sPath = oToken.value.replace(/%2a/i, "*");
			if (this.advanceIf("(")) {
				sPrefix = "(";
				do {
					sPath += sPrefix + this.advance("PATH").value;
					sPrefix = ",";
				} while (this.advanceIf(","));
				sPath += this.advance(")").value;
			}

			aSelect.push(sPath);
		} while (this.advanceIf(","));

		return {"$select" : aSelect};
	};

	/**
	 * Parses a system query option in the form "$foo=bar".
	 *
	 * @returns {object} An object with "$foo" as key and the parsed value of bar as value.
	 */
	SystemQueryOptionParser.prototype.parseSystemQueryOption = function () {
		var oToken = this.advance('OPTION');

		switch (oToken.value) {
			case "$expand":
				return this.parseExpand();
			case "$select":
				return this.parseSelect();
			default:
				return this.parseAnythingWithBrackets(oToken);
		}
	};

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
			iOffset,
			oToken,
			aTokens = [],
			sValue;

		while (sNext.length) {
			aMatches = rToken.exec(sNext);
			iOffset = 0;
			if (aMatches) {
				sValue = aMatches[0];
				if (aMatches[6]) {
					sId = "OPTION";
				} else if (aMatches[5]) {
					sId = "VALUE";
				} else if (aMatches[4]) {
					sId = "PATH";
					if (sValue === "false" || sValue === "true" || sValue === "null") {
						sId = "VALUE";
					}
				} else if (aMatches[3]) { // a %-escaped delimiter
					sId = unescape(aMatches[3]);
				} else if (aMatches[2]) { // an operator
					sId = aMatches[2];
					iOffset = aMatches[1].length;
				} else { // a delimiter
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
					at : iAt + iOffset,
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

	return {
		/**
		 * Builds the filter string.
		 *
		 * @param {object} oSyntaxTree The syntax tree
		 * @returns {string} The filter string
		 */
		buildFilterString : function (oSyntaxTree) {
			return oSyntaxTree.left.value + oSyntaxTree.value + oSyntaxTree.right.value;
		},

		/**
		 * Parses a filter string to a syntax tree. In this tree
		 * <ul>
		 * <li> paths are leafs with <code>id="PATH"</code> and the path in <code>value</code>
		 * <li> literals are leafs with <code>id="VALUE"</code> and the literal (as parsed) in
		 *   <code>value</code>
		 * <li> binary operations are nodes with the operator in <code>id</code>, the operator incl.
		 *   the surrounding required space in <code>value</code> and <code>left</code> and
		 *   <code>right</code> containing syntax trees for the operands.
		 * </ul>
		 * <code>at</code> always contains the position where this token started (starting with 1).
		 *
		 * Example: <code>parseFilter("foo eq 'bar')</code> results in
		 * <pre>
			 {
				id : "eq", value : " eq ", at : 5,
	            left : {id : "PATH", value : "foo", at : 1},
				right : {id : "VALUE", value : "'bar'", at : 8}
			 }
		 * </pre>
		 *
		 * @param {string} sFilter The filter string
		 * @returns {object} The syntax tree.
		 */
		parseFilter : function (sFilter) {
			return new FilterParser().parse(sFilter);
		},

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
		 * <code>$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name);$select=*;$count=true;$orderby=Name desc)</code> is converted to
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
			return new SystemQueryOptionParser().parse(sOption);
		}
	};
}, /* bExport= */false);
