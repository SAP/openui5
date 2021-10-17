import jQueryDOM from "sap/ui/thirdparty/jquery";
export class dataTableUtils {
    static toTable(aData: any, vNorm: any) {
        this._testArrayInput(aData, "toTable");
        var fnNorm = this._getNormalizationFunction(vNorm, "toTable");
        var aKeys = aData[0].map(fnNorm);
        return aData.slice(1).map(function (aRow) {
            var oGenerated = {};
            for (var i = 0; i < aKeys.length; ++i) {
                var sCurrentKey = aKeys[i];
                if (oGenerated.hasOwnProperty(sCurrentKey) === false) {
                    oGenerated[sCurrentKey] = aRow[i];
                }
                else {
                    throw new Error("dataTableUtils.toTable: data table contains duplicate header: | " + sCurrentKey + " |");
                }
            }
            return oGenerated;
        });
    }
    static toObject(aData: any, vNorm: any) {
        this._testArrayInput(aData, "toObject");
        var fnNorm = this._getNormalizationFunction(vNorm, "toObject");
        this._detectDuplicateKeys(aData, fnNorm);
        var oResult = {};
        aData.forEach(function (aRow) {
            var sKey = fnNorm(aRow[0]);
            var vValue = aRow.slice(1);
            if (vValue.length === 1) {
                vValue = vValue[0];
            }
            else {
                vValue = vValue.reduceRight(function (i, j) { var o = {}; o[fnNorm(j)] = i; return o; });
            }
            if (!oResult.hasOwnProperty(sKey)) {
                oResult[sKey] = vValue;
            }
            else {
                jQueryDOM.extend(oResult[sKey], vValue);
            }
        });
        return oResult;
    }
    private static _detectDuplicateKeys(aData: any, fnNorm: any) {
        var oRowSet = {};
        aData.forEach(function (aRow) {
            var aKeys = aRow.slice(0, (aRow.length - 1)).map(fnNorm);
            for (var i = aKeys.length; i > 0; --i) {
                var sKeys = aKeys.slice(0, i).join("-");
                if (!oRowSet[sKeys]) {
                    oRowSet[sKeys] = aRow;
                }
                else {
                    var aOldRow = oRowSet[sKeys];
                    var aOldKeys = aOldRow.slice(0, (aOldRow.length - 1)).map(fnNorm);
                    if ((aOldRow.length !== aRow.length) || (aOldKeys.every(function (str, index) { return aKeys[index] === str; }))) {
                        var sOutput = "| " + aOldRow.join(" | ") + " |";
                        throw new Error("dataTableUtils.toObject: data table row is being overwritten: " + sOutput);
                    }
                }
            }
        });
    }
    private static _getNormalizationFunction(vFun: any, sFunc: any) {
        var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'vNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";
        if (typeof vFun === "string" || vFun instanceof String) {
            var fnNormalize = this.normalization[vFun];
            if (fnNormalize === undefined) {
                throw new Error(sErrorMessage);
            }
            return fnNormalize;
        }
        else if (typeof vFun === "function") {
            return vFun;
        }
        else if (vFun === undefined || vFun === null) {
            return this.normalization.none;
        }
        else {
            throw new Error(sErrorMessage);
        }
    }
    private static _testNormalizationInput(sString: any, sNormalizationFunction: any) {
        if (typeof sString !== "string" && !(sString instanceof String)) {
            throw new Error("dataTableUtils.normalization." + sNormalizationFunction + ": parameter 'sString' must be a valid string");
        }
    }
    private static _testArrayInput(aArray: any, sFunc: any) {
        var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'aData' must be an Array of Array of Strings";
        if (!Array.isArray(aArray)) {
            throw new Error(sErrorMessage);
        }
        if (!aArray.every(function (a) {
            return Array.isArray(a) && (a.every(function (s) { return (typeof s === "string" || s instanceof String); }));
        })) {
            throw new Error(sErrorMessage);
        }
    }
}
function normalize(sString, sSpaceReplacement) {
    sSpaceReplacement = sSpaceReplacement || " ";
    return sString.replace(/[\-_]/g, " ").trim().replace(/(?!\s)\W/g, "").replace(/\s+/g, sSpaceReplacement);
}