import jQuery from "jquery.sap.global";
import uid from "sap/base/util/uid";
import hash from "sap/base/strings/hash";
import uniqueSort from "sap/base/util/array/uniqueSort";
import deepEqual from "sap/base/util/deepEqual";
import each from "sap/base/util/each";
import diff from "sap/base/util/array/diff";
import JSTokenizer from "sap/base/util/JSTokenizer";
import merge from "sap/base/util/merge";
import UriParameters from "sap/base/util/UriParameters";
jQuery.sap.uid = uid;
jQuery.sap.hashCode = hash;
jQuery.sap.unique = uniqueSort;
jQuery.sap.equal = deepEqual;
jQuery.sap.each = each;
jQuery.sap.arraySymbolDiff = diff;
jQuery.sap._createJSTokenizer = function () {
    return new JSTokenizer();
};
jQuery.sap.parseJS = JSTokenizer.parseJS;
jQuery.sap.extend = function () {
    var args = arguments, deep = false;
    if (typeof arguments[0] === "boolean") {
        deep = arguments[0];
        args = Array.prototype.slice.call(arguments, 1);
    }
    if (deep) {
        return merge.apply(this, args);
    }
    else {
        var copy, name, options, target = arguments[0] || {}, i = 1, length = arguments.length;
        if (typeof target !== "object" && typeof target !== "function") {
            target = {};
        }
        for (; i < length; i++) {
            options = arguments[i];
            for (name in options) {
                copy = options[name];
                if (name === "__proto__" || target === copy) {
                    continue;
                }
                target[name] = copy;
            }
        }
        return target;
    }
};
jQuery.sap.getUriParameters = function getUriParameters(sUri) {
    return UriParameters.fromURL(sUri || window.location.href);
};
jQuery.sap.delayedCall = function delayedCall(iDelay, oObject, method, aParameters) {
    return setTimeout(function () {
        if (typeof method === "string") {
            method = oObject[method];
        }
        method.apply(oObject, aParameters || []);
    }, iDelay);
};
jQuery.sap.clearDelayedCall = function clearDelayedCall(sDelayedCallId) {
    clearTimeout(sDelayedCallId);
    return this;
};
jQuery.sap.intervalCall = function intervalCall(iInterval, oObject, method, aParameters) {
    return setInterval(function () {
        if (typeof method === "string") {
            method = oObject[method];
        }
        method.apply(oObject, aParameters || []);
    }, iInterval);
};
jQuery.sap.clearIntervalCall = function clearIntervalCall(sIntervalCallId) {
    clearInterval(sIntervalCallId);
    return this;
};
jQuery.sap.forIn = each;
jQuery.sap.arrayDiff = function (aOld, aNew, fnCompare, bUniqueEntries) {
    fnCompare = fnCompare || function (vValue1, vValue2) {
        return deepEqual(vValue1, vValue2);
    };
    var aOldRefs = [];
    var aNewRefs = [];
    var aMatches = [];
    for (var i = 0; i < aNew.length; i++) {
        var oNewEntry = aNew[i];
        var iFound = 0;
        var iTempJ;
        if (bUniqueEntries && fnCompare(aOld[i], oNewEntry)) {
            iFound = 1;
            iTempJ = i;
        }
        else {
            for (var j = 0; j < aOld.length; j++) {
                if (fnCompare(aOld[j], oNewEntry)) {
                    iFound++;
                    iTempJ = j;
                    if (bUniqueEntries || iFound > 1) {
                        break;
                    }
                }
            }
        }
        if (iFound == 1) {
            var oMatchDetails = {
                oldIndex: iTempJ,
                newIndex: i
            };
            if (aMatches[iTempJ]) {
                delete aOldRefs[iTempJ];
                delete aNewRefs[aMatches[iTempJ].newIndex];
            }
            else {
                aNewRefs[i] = {
                    data: aNew[i],
                    row: iTempJ
                };
                aOldRefs[iTempJ] = {
                    data: aOld[iTempJ],
                    row: i
                };
                aMatches[iTempJ] = oMatchDetails;
            }
        }
    }
    for (var i = 0; i < aNew.length - 1; i++) {
        if (aNewRefs[i] && !aNewRefs[i + 1] && aNewRefs[i].row + 1 < aOld.length && !aOldRefs[aNewRefs[i].row + 1] && fnCompare(aOld[aNewRefs[i].row + 1], aNew[i + 1])) {
            aNewRefs[i + 1] = {
                data: aNew[i + 1],
                row: aNewRefs[i].row + 1
            };
            aOldRefs[aNewRefs[i].row + 1] = {
                data: aOldRefs[aNewRefs[i].row + 1],
                row: i + 1
            };
        }
    }
    for (var i = aNew.length - 1; i > 0; i--) {
        if (aNewRefs[i] && !aNewRefs[i - 1] && aNewRefs[i].row > 0 && !aOldRefs[aNewRefs[i].row - 1] && fnCompare(aOld[aNewRefs[i].row - 1], aNew[i - 1])) {
            aNewRefs[i - 1] = {
                data: aNew[i - 1],
                row: aNewRefs[i].row - 1
            };
            aOldRefs[aNewRefs[i].row - 1] = {
                data: aOldRefs[aNewRefs[i].row - 1],
                row: i - 1
            };
        }
    }
    var aDiff = [];
    if (aNew.length == 0) {
        for (var i = 0; i < aOld.length; i++) {
            aDiff.push({
                index: 0,
                type: "delete"
            });
        }
    }
    else {
        var iNewListIndex = 0;
        if (!aOldRefs[0]) {
            for (var i = 0; i < aOld.length && !aOldRefs[i]; i++) {
                aDiff.push({
                    index: 0,
                    type: "delete"
                });
                iNewListIndex = i + 1;
            }
        }
        for (var i = 0; i < aNew.length; i++) {
            if (!aNewRefs[i] || aNewRefs[i].row > iNewListIndex) {
                aDiff.push({
                    index: i,
                    type: "insert"
                });
            }
            else {
                iNewListIndex = aNewRefs[i].row + 1;
                for (var j = aNewRefs[i].row + 1; j < aOld.length && (!aOldRefs[j] || aOldRefs[j].row < i); j++) {
                    aDiff.push({
                        index: i + 1,
                        type: "delete"
                    });
                    iNewListIndex = j + 1;
                }
            }
        }
    }
    return aDiff;
};