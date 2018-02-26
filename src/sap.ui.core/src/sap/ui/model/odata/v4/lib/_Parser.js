/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Parser
sap.ui.define([
], function () {
	"use strict";

	var // The delimiters in a system query option, possibly %-encoded (their hex value listed in
		// aMatches[3] if encoded)
		sDelimiters = "[=(),; \t\"']|%(09|20|22|27|28|29|2c|2C|3b|3B)",
		// A system query option
		sSystemQueryOption = "\\$\\w+",
		// ABNF rule oDataIdentifier
		sODataIdentifier = "[a-zA-Z_\\u0080-\\uFFFF][\\w\\u0080-\\uFFFF]*",
		// a whitespace character
		sWhitespace = "(?:[ \\t]|%09|%20)",
		// "required white space"
		rRws = new RegExp(sWhitespace + "+", "g"),
		// "not" followed by "required white space"
		rNot = new RegExp("^not" + sWhitespace + "+"),
		// OData operators (only recognized when surrounded by spaces; aMatches[1] contains the
		// leading spaces, aMatches[2] the operator if found)
		sOperators = "(" + sWhitespace + "+)(and|eq|ge|gt|le|lt|ne|or)" + sWhitespace + "*",
		// a GUID (has to be recognized before a path because it may start with a letter)
		sGuid = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
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
		// A Token: either an operator, a delimiter, a GUID (in aMatches[4]), a path (in
		// aMatches[5]), a value (in aMatches[6]) or a system query option (in aMatches[7])
		rToken = new RegExp("^(?:" + sOperators +  "|" + sDelimiters + "|(" + sGuid + ")|("
			+ sPath + ")|(" + sValue + ")|(" + sSystemQueryOption + "))"),
		// The two hex digits of a %-escape
		rEscapeDigits = /^[0-9a-f]{2}$/i,
		// The list of built-in functions
		mFunctions = {
			"ceiling" : {
				ambiguousParameters : true
			},
			"concat" : {
				type : "Edm.String"
			},
			"contains" : {
				type : "Edm.Boolean"
			},
			"day" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			},
			"endswith" : {
				type : "Edm.Boolean"
			},
			"floor" : {
				ambiguousParameters : true
			},
			"hour" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			},
			"indexof" : {
				type : "Edm.Int32"
			},
			"length" : {
				type : "Edm.Int32"
			},
			"minute" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			},
			"month" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			},
			"round" : {
				ambiguousParameters : true
			},
			"second" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			},
			"startswith" : {
				type : "Edm.Boolean"
			},
			"substring" : {
				type : "Edm.String"
			},
			"tolower" : {
				type : "Edm.String"
			},
			"toupper" : {
				type : "Edm.String"
			},
			"trim" : {
				type : "Edm.String"
			},
			"year" : {
				type : "Edm.Int32",
				ambiguousParameters : true
			}
		},
		// The symbol table for the filter parser
		mFilterParserSymbols = {
			"(" : {
				lbp : 9,
				led : function (oToken, oLeft) {
					var oFunction, oParameter;

					if (oLeft.id !== "PATH") {
						this.error("Unexpected ", oToken);
					}
					oFunction = mFunctions[oLeft.value];
					if (!oFunction) {
						this.error("Unknown function ", oLeft);
					}
					oLeft.id = "FUNCTION";
					if (oFunction.type) {
						oLeft.type = oFunction.type;
					}
					oLeft.parameters = [];
					do {
						this.advanceBws();
						oParameter = this.expression(0);
						if (oFunction.ambiguousParameters) {
							oParameter.ambiguous = true;
						}
						oLeft.parameters.push(oParameter);
						this.advanceBws();
					} while (this.advanceIf(","));
					this.advanceBws();
					this.advance(')');
					return oLeft;
				},
				nud : function () {
					this.advanceBws();
					var oToken = this.expression(0);
					this.advanceBws();
					this.advance(')');
					return oToken;
				}
			},
			"not" : {
				lbp : 7,
				nud : function (oToken) {
					oToken.precedence = 7;
					oToken.right = this.expression(7);
					oToken.type = "Edm.Boolean";
					return oToken;
				}
			}
		};

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
				oToken.type = "Edm.Boolean"; // Note: currently we only support logical operators
				oToken.precedence = iLbp;
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
				oToken.precedence = 99; // prevent it from being enclosed in brackets
				return oToken;
			}
		};
	}

	addInfixOperator("and", 2);
	addInfixOperator("eq", 3);
	addInfixOperator("ge", 4);
	addInfixOperator("gt", 4);
	addInfixOperator("le", 4);
	addInfixOperator("lt", 4);
	addInfixOperator("ne", 3);
	addInfixOperator("or", 1);
	addLeafSymbol("PATH");
	addLeafSymbol("VALUE");

	//*****************************************************************************************
	/**
	 * The base parser class. Takes care of token and error handling.
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
	 * Checks that all tokens have been consumed.
	 *
	 * @throws {SyntaxError} If there are unconsumed tokens
	 */
	Parser.prototype.finish = function () {
		if (this.iCurrentToken < this.aTokens.length) {
			this.expected("end of input", this.aTokens[this.iCurrentToken]);
		}
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

	//*****************************************************************************************
	/**
	 * A parser that is able to parse a filter string into a syntax tree which recognizes paths,
	 * comparison operators, literals and built-in functions (which are identical in V2 and V4).
	 */
	function FilterParser() {
	}

	FilterParser.prototype = Object.create(Parser.prototype);

	/**
	 * Advances to the next token that is not a whitespace character. (Skips over "bad whitespace".)
	 */
	FilterParser.prototype.advanceBws = function () {
		var oToken;

		for (;;) {
			oToken = this.current();
			if (!oToken || (oToken.id !== " " && oToken.id !== "\t")) {
				return;
			}
			this.advance();
		}
	};

	/**
	 * Parses a filter expression starting at the current token.
	 *
	 * @param {number} iRbp A "right binding power"
	 * @returns {object} The syntax tree for that expression
	 */
	FilterParser.prototype.expression = function (iRbp) {
		var fnLeft, oLeft, oToken;

		oToken = this.advance();
		if (!oToken) {
			this.expected("expression");
		}
		fnLeft = this.getSymbolValue(oToken, "nud");
		if (!fnLeft) {
			this.expected("expression", oToken);
		}
		oLeft = fnLeft.call(this, oToken);
		oToken = this.current();
		while (oToken && this.getSymbolValue(oToken, "lbp", 0) > iRbp) {
			oLeft = this.getSymbolValue(oToken, "led").call(this, this.advance(), oLeft);
			oToken = this.current();
		}
		return oLeft;
	};

	/**
	 * Returns a value from the symbol table entry for the token.
	 *
	 * @param {object} oToken The token
	 * @param {string} sWhat The key in the symbol table entry
	 * @param {any} [vDefault] The default value if nothing is found in the symbol table entry
	 * @returns {any} The value
	 */
	FilterParser.prototype.getSymbolValue = function (oToken, sWhat, vDefault) {
		var oSymbol = mFilterParserSymbols[oToken.id];

		return oSymbol && sWhat in oSymbol ?  oSymbol[sWhat] : vDefault;
	};

	/**
	 * Parses a filter string.
	 *
	 * @param {string} sFilter The filter string
	 * @returns {object} The syntax tree for the filter
	 * @throws {SyntaxError} If there is a syntax error
	 */
	FilterParser.prototype.parse = function (sFilter) {
		var oResult;

		this.init(sFilter);
		oResult = this.expression(0);
		this.finish();
		return oResult;
	};

	//*****************************************************************************************
	/**
	 * A parser that is able to parse key predicates.
	 */
	function KeyPredicateParser() {
	}

	KeyPredicateParser.prototype = Object.create(Parser.prototype);

	/**
	 * Parses a key predicate.
	 *
	 * @param {string} sKeyPredicate The key predicate
	 * @returns {object} The object representation
	 * @throws {SyntaxError} If there is a syntax error
	 */
	KeyPredicateParser.prototype.parse = function (sKeyPredicate) {
		var sKey,
			oKeyProperties = {},
			sValue;

		this.init(sKeyPredicate);
		this.advance("(");
		if (this.current().id === "VALUE") {
			oKeyProperties[""] = this.advance().value;
		} else {
			do {
				sKey = this.advance("PATH").value;
				this.advance("=");
				sValue = this.advance("VALUE").value;
				oKeyProperties[sKey] = sValue;
			} while (this.advanceIf(","));
		}
		this.advance(")");
		this.finish();
		return oKeyProperties;
	};

	//*****************************************************************************************
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
	 * @param {string} sOption The option string
	 * @returns {object} The object representation
	 * @throws {SyntaxError} If there is a syntax error
	 */
	SystemQueryOptionParser.prototype.parse = function (sOption) {
		var oResult;

		this.init(sOption);
		oResult = this.parseSystemQueryOption();
		this.finish();
		return oResult;
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

	//*****************************************************************************************
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

			if (c === "%" && sNext[i + 1] === "2" && sNext[i + 2] === "7") {
				c = "'";
				if (bConsume) {
					i += 2;
				}
			}
			if (bConsume) {
				i += 1;
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
				if (aMatches[7]) {
					sId = "OPTION";
				} else if (aMatches[6] || aMatches[4]) {
					sId = "VALUE";
				} else if (aMatches[5]) {
					sId = "PATH";
					if (sValue === "false" || sValue === "true" || sValue === "null") {
						sId = "VALUE";
					} else if (sValue === "not") {
						sId = "not";
						aMatches = rNot.exec(sNext);
						if (aMatches) {
							sValue = aMatches[0];
						}
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

			function serialize(oNode, iParentPrecedence) {
				var sFilter;

				if (!oNode) {
					return "";
				}
				if (oNode.parameters) {
					sFilter = oNode.parameters.map(function (oParameter) {
						return serialize(oParameter, 0);
					}).join(",");
					return oNode.value + "(" + sFilter + ")";
				}
				sFilter = serialize(oNode.left, oNode.precedence) + oNode.value
					+ serialize(oNode.right, oNode.precedence);
				if (oNode.precedence < iParentPrecedence) {
					sFilter = "(" + sFilter + ")";
				}
				return sFilter;
			}

			return serialize(oSyntaxTree, 0);
		},

		/**
		 * Parses a filter string to a syntax tree. In this tree
		 * <ul>
		 * <li> paths are leafs with <code>id="PATH"</code> and the path in <code>value</code>
		 * <li> literals are leafs with <code>id="VALUE"</code> and the literal (as parsed) in
		 *   <code>value</code>
		 * <li> operations are nodes with the operator in <code>id</code>, the operator incl.
		 *   the surrounding required space in <code>value</code> and <code>left</code> and
		 *   <code>right</code> containing syntax trees for the operands. <code>not</code> only uses
		 *   <code>right</code>.
		 * <li> functions are nodes with <code>id="FUNCTION"</code>,the name in <code>value</code>
		 *   and an array of <code>parameters</code>.
		 * </ul>
		 * If the type is known (especially for logical operators and functions), it is given in
		 * <code>type</code>. If a function parameter may have different types (like Edm.Decimal or
		 * Edm.Double in <code>round</code>), it has the property <code>ambiguous: true</code>.
		 * <code>at</code> always contains the position where this token started (starting with 1).
		 *
		 * Example: <code>parseFilter("foo eq 'bar' and length(baz) ne 5")</code> results in
		 * <pre>
			{
				id : "and", value : " and ", type : "Edm.Boolean", at : 14,
				left : {
					id : "eq", value : " eq ", type : "Edm.Boolean", at : 5,
					left : {id : "PATH", value : "foo", at : 1},
					right : {id : "VALUE", value : "'bar'", at : 8}
				},
				right : {
					id : "ne", value : " ne ", type : "Edm.Boolean", at : 30,
					left : {
						id : "FUNCTION", value : "length", type : "Edm.Int32", at : 18,
						parameters : [{id : "PATH", value : "baz", at : 25}]
					},
					right : {id : "VALUE", value : "5", at : 33}
				}
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
		 * Parses a key predicate into an object containing name/value pairs. A predicate in the
		 * form "('42')" is returned as {"" : "'42'"}.
		 *
		 * @param {string} sKeyPredicate The key predicate
		 * @returns {object} The name/value pairs
		 */
		parseKeyPredicate : function (sKeyPredicate) {
			return new KeyPredicateParser().parse(sKeyPredicate);
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
