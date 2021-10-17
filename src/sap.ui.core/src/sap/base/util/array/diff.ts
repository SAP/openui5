import deepEqual from "sap/base/util/deepEqual";
import hash from "sap/base/strings/hash";
var fnDiff = function (aOld, aNew, vConfigOrSymbol) {
    var mSymbols = {}, aOldRefs = [], aNewRefs = [], iOldLine, vSymbol, oSymbol, fnSymbol, iOld = 0, iNew = 0, iOldRefLine, iNewRefLine, iOldDistance, iNewDistance, bReplaceEnabled, aDiff = [];
    if (aOld === aNew || deepEqual(aOld, aNew)) {
        return aDiff;
    }
    if (!vConfigOrSymbol || typeof vConfigOrSymbol == "function") {
        fnSymbol = vConfigOrSymbol;
    }
    else {
        fnSymbol = vConfigOrSymbol.symbol;
        bReplaceEnabled = vConfigOrSymbol.replace;
    }
    fnSymbol = fnSymbol || function (vValue) {
        if (typeof vValue !== "string") {
            vValue = JSON.stringify(vValue) || "";
        }
        return hash(vValue);
    };
    for (var i = 0; i < aNew.length; i++) {
        vSymbol = fnSymbol(aNew[i]);
        oSymbol = mSymbols[vSymbol];
        if (!oSymbol) {
            oSymbol = mSymbols[vSymbol] = {
                iNewCount: 0,
                iOldCount: 0
            };
        }
        oSymbol.iNewCount++;
        aNewRefs[i] = {
            symbol: oSymbol
        };
    }
    for (var i = 0; i < aOld.length; i++) {
        vSymbol = fnSymbol(aOld[i]);
        oSymbol = mSymbols[vSymbol];
        if (!oSymbol) {
            oSymbol = mSymbols[vSymbol] = {
                iNewCount: 0,
                iOldCount: 0
            };
        }
        oSymbol.iOldCount++;
        oSymbol.iOldLine = i;
        aOldRefs[i] = {
            symbol: oSymbol
        };
    }
    for (var i = 0; i < aNewRefs.length; i++) {
        oSymbol = aNewRefs[i].symbol;
        if (oSymbol.iNewCount === 1 && oSymbol.iOldCount === 1) {
            aNewRefs[i].line = oSymbol.iOldLine;
            aOldRefs[oSymbol.iOldLine].line = i;
        }
    }
    for (var i = 0; i < aNewRefs.length - 1; i++) {
        iOldLine = aNewRefs[i].line;
        if (iOldLine !== undefined && iOldLine < aOldRefs.length - 1) {
            if (aOldRefs[iOldLine + 1].symbol === aNewRefs[i + 1].symbol) {
                aOldRefs[iOldLine + 1].line = i + 1;
                aNewRefs[i + 1].line = iOldLine + 1;
            }
        }
    }
    for (var i = aNewRefs.length - 1; i > 0; i--) {
        iOldLine = aNewRefs[i].line;
        if (iOldLine !== undefined && iOldLine > 0) {
            if (aOldRefs[iOldLine - 1].symbol === aNewRefs[i - 1].symbol) {
                aOldRefs[iOldLine - 1].line = i - 1;
                aNewRefs[i - 1].line = iOldLine - 1;
            }
        }
    }
    while (iOld < aOld.length || iNew < aNew.length) {
        iNewRefLine = aOldRefs[iOld] && aOldRefs[iOld].line;
        iOldRefLine = aNewRefs[iNew] && aNewRefs[iNew].line;
        if (bReplaceEnabled && iNewRefLine === undefined && iOldRefLine === undefined && iOld < aOld.length && iNew < aNew.length) {
            aDiff.push({
                index: iNew,
                type: "replace"
            });
            iOld++;
            iNew++;
        }
        else if (iOld < aOld.length && (iNewRefLine === undefined || iNewRefLine < iNew)) {
            aDiff.push({
                index: iNew,
                type: "delete"
            });
            iOld++;
        }
        else if (iNew < aNew.length && (iOldRefLine === undefined || iOldRefLine < iOld)) {
            aDiff.push({
                index: iNew,
                type: "insert"
            });
            iNew++;
        }
        else if (iNew === iNewRefLine) {
            iNew++;
            iOld++;
        }
        else {
            iNewDistance = iNewRefLine - iNew;
            iOldDistance = iOldRefLine - iOld;
            if (iNewDistance <= iOldDistance) {
                aDiff.push({
                    index: iNew,
                    type: "insert"
                });
                iNew++;
            }
            else {
                aDiff.push({
                    index: iNew,
                    type: "delete"
                });
                iOld++;
            }
        }
    }
    return aDiff;
};