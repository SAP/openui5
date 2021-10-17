import Log from "sap/base/Log";
import escapeRegExp from "sap/base/strings/escapeRegExp";
import deepEqual from "sap/base/util/deepEqual";
import JSTokenizer from "sap/base/util/JSTokenizer";
import Measurement from "sap/ui/performance/Measurement";
import URI from "sap/ui/thirdparty/URI";
var fnUndefined = CONSTANT.bind(null, undefined), mDefaultGlobals = {
    "Array": Array,
    "Boolean": Boolean,
    "Date": Date,
    "encodeURIComponent": encodeURIComponent,
    "Infinity": Infinity,
    "isFinite": isFinite,
    "isNaN": isNaN,
    "JSON": JSON,
    "Math": Math,
    "NaN": NaN,
    "Number": Number,
    "Object": Object,
    "odata": {
        "collection": function (aElements) {
            return aElements.filter(function (vElement) {
                return vElement !== undefined;
            });
        },
        "compare": function () {
            var oODataUtils = sap.ui.require("sap/ui/model/odata/v4/ODataUtils") || sap.ui.requireSync("sap/ui/model/odata/v4/ODataUtils");
            return oODataUtils.compare.apply(oODataUtils, arguments);
        },
        "fillUriTemplate": function (sExpression, mData) {
            if (!URI.expand) {
                sap.ui.requireSync("sap/ui/thirdparty/URITemplate");
            }
            return URI.expand(sExpression.trim(), mData).toString();
        },
        "uriEncode": function () {
            var oODataUtils = sap.ui.require("sap/ui/model/odata/ODataUtils") || sap.ui.requireSync("sap/ui/model/odata/ODataUtils");
            return oODataUtils.formatValue.apply(oODataUtils, arguments);
        }
    },
    "parseFloat": parseFloat,
    "parseInt": parseInt,
    "RegExp": RegExp,
    "String": String,
    "undefined": undefined
}, rDigit = /\d/, sExpressionParser = "sap.ui.base.ExpressionParser", rIdentifier = /[a-z_$][a-z0-9_$]*/i, rIdentifierStart = /[a-z_$]/i, aPerformanceCategories = [sExpressionParser], sPerformanceParse = sExpressionParser + "#parse", mSymbols = {
    "BINDING": {
        led: unexpected,
        nud: function (oToken, oParser) {
            return BINDING.bind(null, oToken.value);
        }
    },
    "ERROR": {
        lbp: Infinity,
        led: function (oToken, oParser, fnLeft) {
            error(oToken.value.message, oToken.value.text, oToken.value.at);
        },
        nud: function (oToken, oParser) {
            error(oToken.value.message, oToken.value.text, oToken.value.at);
        }
    },
    "IDENTIFIER": {
        led: unexpected,
        nud: function (oToken, oParser) {
            if (!(oToken.value in oParser.globals)) {
                Log.warning("Unsupported global identifier '" + oToken.value + "' in expression parser input '" + oParser.input + "'", undefined, sExpressionParser);
            }
            return CONSTANT.bind(null, oParser.globals[oToken.value]);
        }
    },
    "CONSTANT": {
        led: unexpected,
        nud: function (oToken, oParser) {
            return CONSTANT.bind(null, oToken.value);
        }
    },
    ".": {
        lbp: 18,
        led: function (oToken, oParser, fnLeft) {
            return DOT.bind(null, fnLeft, oParser.advance("IDENTIFIER").value);
        },
        nud: unexpected
    },
    "(": {
        lbp: 17,
        led: function (oToken, oParser, fnLeft) {
            var aArguments = [], bFirst = true;
            while (oParser.current().id !== ")") {
                if (bFirst) {
                    bFirst = false;
                }
                else {
                    oParser.advance(",");
                }
                aArguments.push(oParser.expression(0));
            }
            oParser.advance(")");
            return FUNCTION_CALL.bind(null, fnLeft, aArguments);
        },
        nud: function (oToken, oParser) {
            var fnValue = oParser.expression(0);
            oParser.advance(")");
            return fnValue;
        }
    },
    "[": {
        lbp: 18,
        led: function (oToken, oParser, fnLeft) {
            var fnName = oParser.expression(0);
            oParser.advance("]");
            return PROPERTY_ACCESS.bind(null, fnLeft, fnName);
        },
        nud: function (oToken, oParser) {
            var aElements = [], bFirst = true;
            while (oParser.current().id !== "]") {
                if (bFirst) {
                    bFirst = false;
                }
                else {
                    oParser.advance(",");
                }
                aElements.push(oParser.current().id === "," ? fnUndefined : oParser.expression(0));
            }
            oParser.advance("]");
            return ARRAY.bind(null, aElements);
        }
    },
    "!": {
        lbp: 15,
        led: unexpected,
        nud: function (oToken, oParser) {
            return UNARY.bind(null, oParser.expression(this.lbp), function (x) {
                return !x;
            });
        }
    },
    "typeof": {
        lbp: 15,
        led: unexpected,
        nud: function (oToken, oParser) {
            return UNARY.bind(null, oParser.expression(this.lbp), function (x) {
                return typeof x;
            });
        }
    },
    "?": {
        lbp: 4,
        led: function (oToken, oParser, fnLeft) {
            var fnElse, fnThen;
            fnThen = oParser.expression(this.lbp - 1);
            oParser.advance(":");
            fnElse = oParser.expression(this.lbp - 1);
            return CONDITIONAL.bind(null, fnLeft, fnThen, fnElse);
        },
        nud: unexpected
    },
    ")": {
        led: unexpected,
        nud: unexpected
    },
    "]": {
        led: unexpected,
        nud: unexpected
    },
    "{": {
        led: unexpected,
        nud: function (oToken, oParser) {
            var bFirst = true, sKey, mMap = {}, fnValue;
            while (oParser.current().id !== "}") {
                if (bFirst) {
                    bFirst = false;
                }
                else {
                    oParser.advance(",");
                }
                if (oParser.current() && oParser.current().id === "CONSTANT" && typeof oParser.current().value === "string") {
                    sKey = oParser.advance().value;
                }
                else {
                    sKey = oParser.advance("IDENTIFIER").value;
                }
                oParser.advance(":");
                fnValue = oParser.expression(0);
                mMap[sKey] = fnValue;
            }
            oParser.advance("}");
            return MAP.bind(null, mMap);
        }
    },
    "}": {
        lbp: -1,
        led: unexpected,
        nud: unexpected
    },
    ",": {
        led: unexpected,
        nud: unexpected
    },
    ":": {
        led: unexpected,
        nud: unexpected
    }
}, aTokens = ["===", "!==", "!", "||", "&&", ".", "(", ")", "{", "}", ":", ",", "?", "*", "/", "%", "+", "-", "<=", "<", ">=", ">", "[", "]"], rTokens;
aTokens.forEach(function (sToken, i) {
    aTokens[i] = escapeRegExp(sToken);
});
rTokens = new RegExp(aTokens.join("|"), "g");
addInfix("*", 14, function (x, y) {
    return x * y;
});
addInfix("/", 14, function (x, y) {
    return x / y;
});
addInfix("%", 14, function (x, y) {
    return x % y;
});
addInfix("+", 13, function (x, y) {
    return x + y;
}).nud = function (oToken, oParser) {
    return UNARY.bind(null, oParser.expression(this.lbp), function (x) {
        return +x;
    });
};
addInfix("-", 13, function (x, y) {
    return x - y;
}).nud = function (oToken, oParser) {
    return UNARY.bind(null, oParser.expression(this.lbp), function (x) {
        return -x;
    });
};
addInfix("<=", 11, function (x, y) {
    return x <= y;
});
addInfix("<", 11, function (x, y) {
    return x < y;
});
addInfix(">=", 11, function (x, y) {
    return x >= y;
});
addInfix(">", 11, function (x, y) {
    return x > y;
});
addInfix("in", 11, function (x, y) {
    return x in y;
});
addInfix("===", 10, function (x, y) {
    return x === y;
});
addInfix("!==", 10, function (x, y) {
    return x !== y;
});
addInfix("&&", 7, function (x, fnY) {
    return x && fnY();
}, true);
addInfix("||", 6, function (x, fnY) {
    return x || fnY();
}, true);
function ARRAY(aElements, aParts) {
    return aElements.map(function (fnElement) {
        return fnElement(aParts);
    });
}
function BINDING(i, aParts) {
    return aParts[i];
}
function CONDITIONAL(fnCondition, fnThen, fnElse, aParts) {
    return fnCondition(aParts) ? fnThen(aParts) : fnElse(aParts);
}
function CONSTANT(v) {
    return v;
}
function DOT(fnLeft, sIdentifier, aParts, oReference) {
    var oParent = fnLeft(aParts), vChild = oParent[sIdentifier];
    if (oReference) {
        oReference.base = oParent;
    }
    return vChild;
}
function FUNCTION_CALL(fnLeft, aArguments, aParts) {
    var oReference = {};
    return fnLeft(aParts, oReference).apply(oReference.base, aArguments.map(function (fnArgument) {
        return fnArgument(aParts);
    }));
}
function INFIX(fnLeft, fnRight, fnOperator, bLazy, aParts) {
    return fnOperator(fnLeft(aParts), bLazy ? fnRight.bind(null, aParts) : fnRight(aParts));
}
function MAP(mMap, aParts) {
    var sKey, mResult = {};
    for (sKey in mMap) {
        mResult[sKey] = mMap[sKey](aParts);
    }
    return mResult;
}
function PROPERTY_ACCESS(fnLeft, fnName, aParts, oReference) {
    var oParent = fnLeft(aParts), sIdentifier = fnName(aParts), vChild = oParent[sIdentifier];
    if (oReference) {
        oReference.base = oParent;
    }
    return vChild;
}
function UNARY(fnRight, fnOperator, aParts) {
    return fnOperator(fnRight(aParts));
}
function addInfix(sId, iBindingPower, fnOperator, bLazy) {
    mSymbols[sId] = {
        lbp: iBindingPower,
        led: function (oToken, oParser, fnLeft) {
            var rbp = bLazy ? this.lbp - 1 : this.lbp;
            return INFIX.bind(null, fnLeft, oParser.expression(rbp), fnOperator, bLazy);
        },
        nud: unexpected
    };
    return mSymbols[sId];
}
function error(sMessage, sInput, iAt) {
    var oError = new SyntaxError(sMessage);
    oError.at = iAt;
    oError.text = sInput;
    if (iAt !== undefined) {
        sMessage += " at position " + iAt;
    }
    Log.error(sMessage, sInput, sExpressionParser);
    throw oError;
}
function unexpected(oToken) {
    error("Unexpected " + oToken.id, oToken.input, oToken.start + 1);
}
function tokenize(fnResolveBinding, sInput, iStart) {
    var aParts = [], aPrimitiveValueBindings = [], aTokens = [], oTokenizer = new JSTokenizer();
    function saveBindingAsPart(oBinding, iStart, bTargetTypeAny) {
        var bHasNonPrimitiveValue = false, sKey, oPrimitiveValueBinding, i;
        function setTargetType(oBinding) {
            if (bTargetTypeAny) {
                if (oBinding.parts) {
                    oBinding.parts.forEach(setTargetType);
                }
                else {
                    oBinding.targetType = oBinding.targetType || "any";
                }
            }
        }
        for (sKey in oBinding) {
            switch (typeof oBinding[sKey]) {
                case "boolean":
                case "number":
                case "string":
                case "undefined": break;
                default: bHasNonPrimitiveValue = true;
            }
        }
        setTargetType(oBinding);
        if (bHasNonPrimitiveValue) {
            oPrimitiveValueBinding = JSTokenizer.parseJS(sInput, iStart).result;
            setTargetType(oPrimitiveValueBinding);
        }
        else {
            oPrimitiveValueBinding = oBinding;
        }
        for (i = 0; i < aParts.length; i += 1) {
            if (deepEqual(aPrimitiveValueBindings[i], oPrimitiveValueBinding)) {
                return i;
            }
        }
        aPrimitiveValueBindings[i] = oPrimitiveValueBinding;
        aParts[i] = oBinding;
        return i;
    }
    function consumeToken() {
        var ch, oBinding, iIndex, aMatches, oToken;
        oTokenizer.white();
        ch = oTokenizer.getCh();
        iIndex = oTokenizer.getIndex();
        if ((ch === "$" || ch === "%") && sInput[iIndex + 1] === "{") {
            oBinding = fnResolveBinding(sInput, iIndex + 1);
            oToken = {
                id: "BINDING",
                value: saveBindingAsPart(oBinding.result, iIndex + 1, ch === "%")
            };
            oTokenizer.setIndex(oBinding.at);
        }
        else if (rIdentifierStart.test(ch)) {
            aMatches = rIdentifier.exec(sInput.slice(iIndex));
            switch (aMatches[0]) {
                case "false":
                case "null":
                case "true":
                    oToken = { id: "CONSTANT", value: oTokenizer.word() };
                    break;
                case "in":
                case "typeof":
                    oToken = { id: aMatches[0] };
                    oTokenizer.setIndex(iIndex + aMatches[0].length);
                    break;
                default:
                    oToken = { id: "IDENTIFIER", value: aMatches[0] };
                    oTokenizer.setIndex(iIndex + aMatches[0].length);
            }
        }
        else if (rDigit.test(ch) || ch === "." && rDigit.test(sInput[iIndex + 1])) {
            oToken = { id: "CONSTANT", value: oTokenizer.number() };
        }
        else if (ch === "'" || ch === "\"") {
            oToken = { id: "CONSTANT", value: oTokenizer.string() };
        }
        else {
            rTokens.lastIndex = iIndex;
            aMatches = rTokens.exec(sInput);
            if (!aMatches || aMatches.index !== iIndex) {
                return false;
            }
            oToken = { id: aMatches[0] };
            oTokenizer.setIndex(iIndex + aMatches[0].length);
        }
        oToken.input = sInput;
        oToken.start = iIndex;
        oToken.end = oTokenizer.getIndex();
        aTokens.push(oToken);
        return true;
    }
    oTokenizer.init(sInput, iStart);
    try {
        while (consumeToken()) { }
    }
    catch (e) {
        if (e.name === "SyntaxError") {
            aTokens.push({
                id: "ERROR",
                value: e
            });
        }
        else {
            throw e;
        }
    }
    return {
        at: oTokenizer.getIndex(),
        parts: aParts,
        tokens: aTokens
    };
}
function tryCatch(fnFormatter, sInput) {
    return function () {
        try {
            return fnFormatter.apply(this, arguments);
        }
        catch (ex) {
            Log.warning(String(ex), sInput, sExpressionParser);
        }
    };
}
function parse(aTokens, sInput, mGlobals) {
    var fnFormatter, iNextToken = 0, oParser = {
        advance: advance,
        current: current,
        expression: expression,
        globals: mGlobals,
        input: sInput
    }, oToken;
    function advance(sExpectedTokenId) {
        var oToken = aTokens[iNextToken];
        if (sExpectedTokenId) {
            if (!oToken) {
                error("Expected " + sExpectedTokenId + " but instead saw end of input", sInput);
            }
            else if (oToken.id !== sExpectedTokenId) {
                error("Expected " + sExpectedTokenId + " but instead saw " + sInput.slice(oToken.start, oToken.end), sInput, oToken.start + 1);
            }
        }
        iNextToken += 1;
        return oToken;
    }
    function current() {
        return aTokens[iNextToken];
    }
    function expression(rbp) {
        var fnLeft;
        oToken = advance();
        if (!oToken) {
            error("Expected expression but instead saw end of input", sInput);
        }
        fnLeft = mSymbols[oToken.id].nud(oToken, oParser);
        while (iNextToken < aTokens.length) {
            oToken = current();
            if (rbp >= (mSymbols[oToken.id].lbp || 0)) {
                break;
            }
            advance();
            fnLeft = mSymbols[oToken.id].led(oToken, oParser, fnLeft);
        }
        return fnLeft;
    }
    fnFormatter = expression(0);
    return {
        at: current() && current().start,
        formatter: tryCatch(fnFormatter, sInput)
    };
}