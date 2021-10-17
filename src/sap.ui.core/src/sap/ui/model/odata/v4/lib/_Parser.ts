var sDelimiters = "[=(),; \t\"']|%(09|20|22|27|28|29|2c|2C|3b|3B)", sSystemQueryOption = "\\$\\w+", sODataIdentifier = "[a-zA-Z_\\u0080-\\uFFFF][\\w\\u0080-\\uFFFF]*", sWhitespace = "(?:[ \\t]|%09|%20)", rRws = new RegExp(sWhitespace + "+", "g"), rNot = new RegExp("^not" + sWhitespace + "+"), sOperators = "(" + sWhitespace + "+)(and|eq|ge|gt|le|lt|ne|or)" + sWhitespace + "+", sGuid = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", sStar = "(?:\\*|%2[aA])", sNamedPath = sODataIdentifier + "(?:[./]" + sODataIdentifier + ")*" + "(?:[./]" + sStar + "|/\\$ref|/\\$count)?", sStarPath = sStar + "(?:/\\$ref)?", sPath = sNamedPath + "|" + sStarPath, sValue = "(?:[-+:./\\w\"]|%2[bB])+", rToken = new RegExp("^(?:" + sOperators + "|" + sDelimiters + "|(" + sGuid + ")|(" + sPath + ")|(" + sValue + ")|(" + sSystemQueryOption + "))"), rEscapeDigits = /^[0-9a-f]{2}$/i, mFunctions = {
    "ceiling": {
        ambiguousParameters: true
    },
    "concat": {
        type: "Edm.String"
    },
    "contains": {
        type: "Edm.Boolean"
    },
    "day": {
        type: "Edm.Int32",
        ambiguousParameters: true
    },
    "endswith": {
        type: "Edm.Boolean"
    },
    "floor": {
        ambiguousParameters: true
    },
    "hour": {
        type: "Edm.Int32",
        ambiguousParameters: true
    },
    "indexof": {
        type: "Edm.Int32"
    },
    "length": {
        type: "Edm.Int32"
    },
    "minute": {
        type: "Edm.Int32",
        ambiguousParameters: true
    },
    "month": {
        type: "Edm.Int32",
        ambiguousParameters: true
    },
    "round": {
        ambiguousParameters: true
    },
    "second": {
        type: "Edm.Int32",
        ambiguousParameters: true
    },
    "startswith": {
        type: "Edm.Boolean"
    },
    "substring": {
        type: "Edm.String"
    },
    "tolower": {
        type: "Edm.String"
    },
    "toupper": {
        type: "Edm.String"
    },
    "trim": {
        type: "Edm.String"
    },
    "year": {
        type: "Edm.Int32",
        ambiguousParameters: true
    }
}, mFilterParserSymbols = {
    "(": {
        lbp: 9,
        led: function (oToken, oLeft) {
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
            this.advance(")");
            return oLeft;
        },
        nud: function () {
            this.advanceBws();
            var oToken = this.expression(0);
            this.advanceBws();
            this.advance(")");
            return oToken;
        }
    },
    "not": {
        lbp: 7,
        nud: function (oToken) {
            oToken.precedence = 7;
            oToken.right = this.expression(7);
            oToken.type = "Edm.Boolean";
            return oToken;
        }
    }
};
function addInfixOperator(sId, iLbp) {
    mFilterParserSymbols[sId] = {
        lbp: iLbp,
        led: function (oToken, oLeft) {
            oToken.type = "Edm.Boolean";
            oToken.precedence = iLbp;
            oToken.left = oLeft;
            oToken.right = this.expression(iLbp);
            return oToken;
        }
    };
}
function addLeafSymbol(sId) {
    mFilterParserSymbols[sId] = {
        lbp: 0,
        nud: function (oToken) {
            oToken.precedence = 99;
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
function _Parser() {
}
_Parser.prototype.advance = function (sExpectedTokenId) {
    var oToken = this.current();
    if (sExpectedTokenId && (!oToken || oToken.id !== sExpectedTokenId)) {
        if (sExpectedTokenId === "OPTION") {
            sExpectedTokenId = "system query option";
        }
        else if (sExpectedTokenId.length === 1) {
            sExpectedTokenId = "'" + sExpectedTokenId + "'";
        }
        this.expected(sExpectedTokenId, oToken);
    }
    this.iCurrentToken += 1;
    return oToken;
};
_Parser.prototype.advanceIf = function (sExpectedTokenId) {
    var oToken = this.current();
    if (oToken && oToken.id === sExpectedTokenId) {
        this.iCurrentToken += 1;
        return true;
    }
    return false;
};
_Parser.prototype.current = function () {
    return this.aTokens[this.iCurrentToken];
};
_Parser.prototype.error = function (sMessage, oToken) {
    var sValue;
    if (oToken) {
        sValue = oToken.value;
        sMessage += "'" + (sValue === " " ? sValue : sValue.replace(rRws, "")) + "' at " + oToken.at;
    }
    else {
        sMessage += "end of input";
    }
    throw new SyntaxError(sMessage + ": " + this.sText);
};
_Parser.prototype.expected = function (sWhat, oToken) {
    this.error("Expected " + sWhat + " but instead saw ", oToken);
};
_Parser.prototype.finish = function () {
    if (this.iCurrentToken < this.aTokens.length) {
        this.expected("end of input", this.aTokens[this.iCurrentToken]);
    }
};
_Parser.prototype.init = function (sText) {
    this.sText = sText;
    this.aTokens = tokenize(sText);
    this.iCurrentToken = 0;
};
function _FilterParser() {
}
_FilterParser.prototype = Object.create(_Parser.prototype);
_FilterParser.prototype.advanceBws = function () {
    var oToken;
    for (;;) {
        oToken = this.current();
        if (!oToken || (oToken.id !== " " && oToken.id !== "\t")) {
            return;
        }
        this.advance();
    }
};
_FilterParser.prototype.expression = function (iRbp) {
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
_FilterParser.prototype.getSymbolValue = function (oToken, sWhat, vDefault) {
    var oSymbol = mFilterParserSymbols[oToken.id];
    return oSymbol && sWhat in oSymbol ? oSymbol[sWhat] : vDefault;
};
_FilterParser.prototype.parse = function (sFilter) {
    var oResult;
    this.init(sFilter);
    oResult = this.expression(0);
    this.finish();
    return oResult;
};
function _KeyPredicateParser() {
}
_KeyPredicateParser.prototype = Object.create(_Parser.prototype);
_KeyPredicateParser.prototype.parse = function (sKeyPredicate) {
    var sKey, oKeyProperties = {}, sValue;
    this.init(sKeyPredicate);
    this.advance("(");
    if (this.current().id === "VALUE") {
        oKeyProperties[""] = this.advance().value;
    }
    else {
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
function _SystemQueryOptionParser() {
}
_SystemQueryOptionParser.prototype = Object.create(_Parser.prototype);
_SystemQueryOptionParser.prototype.parse = function (sOption) {
    var oResult;
    this.init(sOption);
    oResult = this.parseSystemQueryOption();
    this.finish();
    return oResult;
};
_SystemQueryOptionParser.prototype.parseAnythingWithBrackets = function (oStartToken) {
    var sValue = "", oResult = {}, oToken, that = this;
    function brackets() {
        for (;;) {
            oToken = that.advance();
            if (!oToken || oToken.id === ";") {
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
_SystemQueryOptionParser.prototype.parseExpand = function () {
    var oExpand = {}, sExpandPath, oQueryOption, sQueryOptionName, vValue;
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
    return { "$expand": oExpand };
};
_SystemQueryOptionParser.prototype.parseSelect = function () {
    var sPath, sPrefix, aSelect = [], oToken;
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
    return { "$select": aSelect };
};
_SystemQueryOptionParser.prototype.parseSystemQueryOption = function () {
    var oToken = this.advance("OPTION");
    switch (oToken.value) {
        case "$expand": return this.parseExpand();
        case "$select": return this.parseSelect();
        default: return this.parseAnythingWithBrackets(oToken);
    }
};
function unescape(sEscape) {
    return String.fromCharCode(parseInt(sEscape, 16));
}
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
    for (i = 1; i < sNext.length;) {
        if (nextChar(true) === "'") {
            if (nextChar(false) !== "'") {
                return sNext.slice(0, i);
            }
            nextChar(true);
        }
    }
    throw new SyntaxError("Unterminated string at " + iAt + ": " + sOption);
}
function tokenizeDoubleQuotedString(sNext, sOption, iAt) {
    var c, sEscape, bEscaping = false, i;
    for (i = 1; i < sNext.length; i += 1) {
        if (bEscaping) {
            bEscaping = false;
        }
        else {
            c = sNext[i];
            if (c === "%") {
                sEscape = sNext.slice(i + 1, i + 3);
                if (rEscapeDigits.test(sEscape)) {
                    c = unescape(sEscape);
                    i += 2;
                }
            }
            if (c === "\"") {
                return sNext.slice(0, i + 1);
            }
            bEscaping = c === "\\";
        }
    }
    throw new SyntaxError("Unterminated string at " + iAt + ": " + sOption);
}
function tokenize(sOption) {
    var iAt = 1, sId, aMatches, sNext = sOption, iOffset, oToken, aTokens = [], sValue;
    while (sNext.length) {
        aMatches = rToken.exec(sNext);
        iOffset = 0;
        if (aMatches) {
            sValue = aMatches[0];
            if (aMatches[7]) {
                sId = "OPTION";
            }
            else if (aMatches[6] || aMatches[4]) {
                sId = "VALUE";
            }
            else if (aMatches[5]) {
                sId = "PATH";
                if (sValue === "false" || sValue === "true" || sValue === "null") {
                    sId = "VALUE";
                }
                else if (sValue === "not") {
                    aMatches = rNot.exec(sNext);
                    if (aMatches) {
                        sId = "not";
                        sValue = aMatches[0];
                    }
                }
            }
            else if (aMatches[3]) {
                sId = unescape(aMatches[3]);
            }
            else if (aMatches[2]) {
                sId = aMatches[2];
                iOffset = aMatches[1].length;
            }
            else {
                sId = aMatches[0];
            }
            if (sId === "\"") {
                sId = "VALUE";
                sValue = tokenizeDoubleQuotedString(sNext, sOption, iAt);
            }
            else if (sId === "'") {
                sId = "VALUE";
                sValue = tokenizeSingleQuotedString(sNext, sOption, iAt);
            }
            oToken = {
                at: iAt + iOffset,
                id: sId,
                value: sValue
            };
        }
        else {
            throw new SyntaxError("Unknown character '" + sNext[0] + "' at " + iAt + ": " + sOption);
        }
        sNext = sNext.slice(sValue.length);
        iAt += sValue.length;
        aTokens.push(oToken);
    }
    return aTokens;
}