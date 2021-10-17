import ExpressionParser from "./ExpressionParser";
import BindingMode from "sap/ui/model/BindingMode";
import Filter from "sap/ui/model/Filter";
import Sorter from "sap/ui/model/Sorter";
import Log from "sap/base/Log";
import JSTokenizer from "sap/base/util/JSTokenizer";
import resolveReference from "sap/base/util/resolveReference";
export class BindingParser {
    static simpleParser(sString: any, oContext: any) {
        if (sString.startsWith("{") && sString.endsWith("}")) {
            return makeSimpleBindingInfo(sString.slice(1, -1));
        }
    }
    static complexParser(sString: any, oContext: any, bUnescape: any, bTolerateFunctionsNotFound: any, bStaticContext: any, bPreferContext: any, mLocals: any) {
        var b2ndLevelMergedNeeded = false, oBindingInfo = { parts: [] }, bMergeNeeded = false, oEnv = {
            oContext: oContext,
            mLocals: mLocals,
            aFunctionsNotFound: undefined,
            bPreferContext: bPreferContext,
            bStaticContext: bStaticContext,
            bTolerateFunctionsNotFound: bTolerateFunctionsNotFound
        }, aFragments = [], bUnescaped, p = 0, m, oEmbeddedBinding;
        function expression(sInput, iStart, oBindingMode) {
            var oBinding = ExpressionParser.parse(resolveEmbeddedBinding.bind(null, oEnv), sString, iStart, null, mLocals || (bStaticContext ? oContext : null));
            function setMode(oBinding, iIndex) {
                if (oBinding.parts) {
                    oBinding.parts.forEach(function (vPart, i) {
                        if (typeof vPart === "string") {
                            vPart = oBinding.parts[i] = { path: vPart };
                        }
                        setMode(vPart, i);
                    });
                    b2ndLevelMergedNeeded = b2ndLevelMergedNeeded || iIndex !== undefined;
                }
                else {
                    oBinding.mode = oBindingMode;
                }
            }
            if (sInput.charAt(oBinding.at) !== "}") {
                throw new SyntaxError("Expected '}' and instead saw '" + sInput.charAt(oBinding.at) + "' in expression binding " + sInput + " at position " + oBinding.at);
            }
            oBinding.at += 1;
            if (oBinding.result) {
                setMode(oBinding.result);
            }
            else {
                aFragments[aFragments.length - 1] = String(oBinding.constant);
                bUnescaped = true;
            }
            return oBinding;
        }
        rFragments.lastIndex = 0;
        while ((m = rFragments.exec(sString)) !== null) {
            if (p < m.index) {
                aFragments.push(sString.slice(p, m.index));
            }
            if (m[1]) {
                aFragments.push(m[1].slice(1));
                bUnescaped = true;
            }
            else {
                aFragments.push(oBindingInfo.parts.length);
                if (sString.indexOf(":=", m.index) === m.index + 1) {
                    oEmbeddedBinding = expression(sString, m.index + 3, BindingMode.OneTime);
                }
                else if (sString.charAt(m.index + 1) === "=") {
                    oEmbeddedBinding = expression(sString, m.index + 2, BindingMode.OneWay);
                }
                else {
                    oEmbeddedBinding = resolveEmbeddedBinding(oEnv, sString, m.index);
                }
                if (oEmbeddedBinding.result) {
                    oBindingInfo.parts.push(oEmbeddedBinding.result);
                    bMergeNeeded = bMergeNeeded || "parts" in oEmbeddedBinding.result;
                }
                rFragments.lastIndex = oEmbeddedBinding.at;
            }
            p = rFragments.lastIndex;
        }
        if (p < sString.length) {
            aFragments.push(sString.slice(p));
        }
        if (oBindingInfo.parts.length > 0) {
            if (aFragments.length === 1) {
                oBindingInfo = oBindingInfo.parts[0];
                bMergeNeeded = b2ndLevelMergedNeeded;
            }
            else {
                oBindingInfo.formatter = makeFormatter(aFragments);
            }
            if (bMergeNeeded) {
                mergeParts(oBindingInfo, sString);
            }
            if (BindingParser._keepBindingStrings) {
                oBindingInfo.bindingString = sString;
            }
            if (oEnv.aFunctionsNotFound) {
                oBindingInfo.functionsNotFound = oEnv.aFunctionsNotFound;
            }
            return oBindingInfo;
        }
        else if (bUnescape && bUnescaped) {
            return aFragments.join("");
        }
    }
    static mergeParts(oBindingInfo: any) {
        var aFormatters = [], aParts = [];
        oBindingInfo.parts.forEach(function (vEmbeddedBinding) {
            var iEnd, fnFormatter = function () {
                return vEmbeddedBinding;
            }, sName, iStart = aParts.length;
            function select() {
                return arguments[iStart];
            }
            if (vEmbeddedBinding && typeof vEmbeddedBinding === "object") {
                if (vEmbeddedBinding.parts) {
                    for (sName in vEmbeddedBinding) {
                        if (sName !== "formatter" && sName !== "parts") {
                            throw new Error("Unsupported property: " + sName);
                        }
                    }
                    aParts = aParts.concat(vEmbeddedBinding.parts);
                    iEnd = aParts.length;
                    if (vEmbeddedBinding.formatter) {
                        fnFormatter = function () {
                            return vEmbeddedBinding.formatter.apply(this, Array.prototype.slice.call(arguments, iStart, iEnd));
                        };
                    }
                    else if (iEnd - iStart > 1) {
                        fnFormatter = function () {
                            return Array.prototype.slice.call(arguments, iStart, iEnd).join(" ");
                        };
                    }
                    else {
                        fnFormatter = select;
                    }
                }
                else if ("path" in vEmbeddedBinding) {
                    aParts.push(vEmbeddedBinding);
                    fnFormatter = select;
                }
            }
            aFormatters.push(fnFormatter);
        });
        oBindingInfo.parts = aParts;
        oBindingInfo.formatter = composeFormatters(aFormatters, oBindingInfo.formatter);
    }
    static parseExpression(sInput: any, iStart: any, oEnv: any, mLocals: any) {
        oEnv = oEnv || {};
        if (mLocals) {
            oEnv.mLocals = mLocals;
        }
        return ExpressionParser.parse(resolveEmbeddedBinding.bind(null, oEnv), sInput, iStart, mLocals);
    }
}
var rObject = /^\{\s*('|"|)[a-zA-Z$_][a-zA-Z0-9$_]*\1\s*:/;
var rFragments = /(\\[\\\{\}])|(\{)/g;
var rBindingChars = /([\\\{\}])/g;
function composeFormatters(aFormatters, fnRootFormatter) {
    function formatter() {
        var i, n = aFormatters.length, aResults = new Array(n);
        for (i = 0; i < n; i += 1) {
            aResults[i] = aFormatters[i].apply(this, arguments);
        }
        if (fnRootFormatter) {
            return fnRootFormatter.apply(this, aResults);
        }
        return n > 1 ? aResults.join(" ") : aResults[0];
    }
    formatter.textFragments = fnRootFormatter && fnRootFormatter.textFragments || "sap.ui.base.BindingParser: composeFormatters";
    return formatter;
}
function makeFormatter(aFragments) {
    var fnFormatter = function () {
        var aResult = [], l = aFragments.length, i;
        for (i = 0; i < l; i++) {
            if (typeof aFragments[i] === "number") {
                aResult.push(arguments[aFragments[i]]);
            }
            else {
                aResult.push(aFragments[i]);
            }
        }
        return aResult.join("");
    };
    fnFormatter.textFragments = aFragments;
    return fnFormatter;
}
function makeSimpleBindingInfo(sPath) {
    var iPos = sPath.indexOf(">"), oBindingInfo = { path: sPath };
    if (iPos > 0) {
        oBindingInfo.model = sPath.slice(0, iPos);
        oBindingInfo.path = sPath.slice(iPos + 1);
    }
    return oBindingInfo;
}
function mergeParts(oBindingInfo, sBinding) {
    try {
        BindingParser.mergeParts(oBindingInfo);
    }
    catch (e) {
        Log.error("Cannot merge parts: " + e.message, sBinding, "sap.ui.base.BindingParser");
    }
}
function resolveBindingInfo(oEnv, oBindingInfo) {
    var mVariables = Object.assign({ ".": oEnv.oContext }, oEnv.mLocals);
    function resolveRef(o, sProp) {
        if (typeof o[sProp] === "string") {
            var sName = o[sProp];
            o[sProp] = resolveReference(o[sProp], mVariables, {
                preferDotContext: oEnv.bPreferContext,
                bindDotContext: !oEnv.bStaticContext
            });
            if (typeof (o[sProp]) !== "function") {
                if (oEnv.bTolerateFunctionsNotFound) {
                    oEnv.aFunctionsNotFound = oEnv.aFunctionsNotFound || [];
                    oEnv.aFunctionsNotFound.push(sName);
                }
                else {
                    Log.error(sProp + " function " + sName + " not found!");
                }
            }
        }
    }
    function resolveType(o) {
        var FNType;
        var sType = o.type;
        if (typeof sType === "string") {
            FNType = resolveReference(sType, mVariables, {
                bindContext: false
            });
            if (typeof FNType === "function") {
                o.type = new FNType(o.formatOptions, o.constraints);
            }
            else {
                o.type = FNType;
            }
            if (!o.type) {
                Log.error("Failed to resolve type '" + sType + "'. Maybe not loaded or a typo?");
            }
            delete o.formatOptions;
            delete o.constraints;
        }
    }
    function resolveEvents(oEvents) {
        if (oEvents != null && typeof oEvents === "object") {
            for (var sName in oEvents) {
                resolveRef(oEvents, sName);
            }
        }
    }
    function resolveFilters(o, sProp) {
        var v = o[sProp];
        if (Array.isArray(v)) {
            v.forEach(function (oObject, iIndex) {
                resolveFilters(v, iIndex);
            });
            return;
        }
        if (v && typeof v === "object") {
            resolveRef(v, "test");
            resolveFilters(v, "filters");
            resolveFilters(v, "condition");
            o[sProp] = new Filter(v);
        }
    }
    function resolveSorters(o, sProp) {
        var v = o[sProp];
        if (Array.isArray(v)) {
            v.forEach(function (oObject, iIndex) {
                resolveSorters(v, iIndex);
            });
            return;
        }
        if (v && typeof v === "object") {
            resolveRef(v, "group");
            resolveRef(v, "comparator");
            o[sProp] = new Sorter(v);
        }
    }
    if (typeof oBindingInfo === "object") {
        if (Array.isArray(oBindingInfo.parts)) {
            oBindingInfo.parts.forEach(function (oPart) {
                resolveBindingInfo(oEnv, oPart);
            });
        }
        resolveType(oBindingInfo);
        resolveFilters(oBindingInfo, "filters");
        resolveSorters(oBindingInfo, "sorter");
        resolveEvents(oBindingInfo.events);
        resolveRef(oBindingInfo, "formatter");
        resolveRef(oBindingInfo, "factory");
        resolveRef(oBindingInfo, "groupHeaderFactory");
    }
    return oBindingInfo;
}
function resolveEmbeddedBinding(oEnv, sInput, iStart) {
    var parseObject = JSTokenizer.parseJS, oParseResult, iEnd;
    if (rObject.test(sInput.slice(iStart))) {
        oParseResult = parseObject(sInput, iStart);
        resolveBindingInfo(oEnv, oParseResult.result);
        return oParseResult;
    }
    iEnd = sInput.indexOf("}", iStart);
    if (iEnd < iStart) {
        throw new SyntaxError("no closing braces found in '" + sInput + "' after pos:" + iStart);
    }
    return {
        result: makeSimpleBindingInfo(sInput.slice(iStart + 1, iEnd)),
        at: iEnd + 1
    };
}
BindingParser.simpleParser.escape = function (sValue) {
    return sValue;
};
BindingParser.complexParser.escape = function (sValue) {
    return sValue.replace(rBindingChars, "\\$1");
};