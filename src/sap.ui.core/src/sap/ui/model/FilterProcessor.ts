import Filter from "./Filter";
import Log from "sap/base/Log";
export class FilterProcessor {
    static groupFilters(aFilters: any) {
        var sCurPath, mSamePath = {}, aResult = [];
        function getFilter(aFilters, bAnd) {
            if (aFilters.length === 1) {
                return aFilters[0];
            }
            if (aFilters.length > 1) {
                return new Filter(aFilters, bAnd);
            }
            return undefined;
        }
        if (!aFilters || aFilters.length === 0) {
            return undefined;
        }
        if (aFilters.length === 1) {
            return aFilters[0];
        }
        aFilters.forEach(function (oFilter) {
            if (oFilter.aFilters || oFilter.sVariable) {
                sCurPath = "__multiFilter";
            }
            else {
                sCurPath = oFilter.sPath;
            }
            if (!mSamePath[sCurPath]) {
                mSamePath[sCurPath] = [];
            }
            mSamePath[sCurPath].push(oFilter);
        });
        for (var sPath in mSamePath) {
            aResult.push(getFilter(mSamePath[sPath], sPath === "__multiFilter"));
        }
        return getFilter(aResult, true);
    }
    static combineFilters(aFilters: any, aApplicationFilters: any) {
        var oGroupedFilter, oGroupedApplicationFilter, oFilter, aCombinedFilters = [];
        oGroupedFilter = this.groupFilters(aFilters);
        oGroupedApplicationFilter = this.groupFilters(aApplicationFilters);
        if (oGroupedFilter) {
            aCombinedFilters.push(oGroupedFilter);
        }
        if (oGroupedApplicationFilter) {
            aCombinedFilters.push(oGroupedApplicationFilter);
        }
        if (aCombinedFilters.length === 1) {
            oFilter = aCombinedFilters[0];
        }
        else if (aCombinedFilters.length > 1) {
            oFilter = new Filter(aCombinedFilters, true);
        }
        return oFilter;
    }
    static apply(aData: any, vFilter: any, fnGetValue: any, mNormalizeCache: any) {
        var oFilter = Array.isArray(vFilter) ? this.groupFilters(vFilter) : vFilter, aFiltered, that = this;
        if (mNormalizeCache) {
            if (!mNormalizeCache[true]) {
                mNormalizeCache[true] = {};
                mNormalizeCache[false] = {};
            }
        }
        else {
            mNormalizeCache = {
                "true": {},
                "false": {}
            };
        }
        this._normalizeCache = mNormalizeCache;
        if (!aData) {
            return [];
        }
        else if (!oFilter) {
            return aData.slice();
        }
        aFiltered = aData.filter(function (vRef) {
            return that._evaluateFilter(oFilter, vRef, fnGetValue);
        });
        return aFiltered;
    }
    private static _evaluateFilter(oFilter: any, vRef: any, fnGetValue: any) {
        var oValue, fnTest;
        if (oFilter.aFilters) {
            return this._evaluateMultiFilter(oFilter, vRef, fnGetValue);
        }
        oValue = fnGetValue(vRef, oFilter.sPath);
        fnTest = this.getFilterFunction(oFilter);
        if (!oFilter.fnCompare || oFilter.bCaseSensitive !== undefined) {
            oValue = this.normalizeFilterValue(oValue, oFilter.bCaseSensitive);
        }
        if (oValue !== undefined && fnTest(oValue)) {
            return true;
        }
        return false;
    }
    private static _evaluateMultiFilter(oMultiFilter: any, vRef: any, fnGetValue: any) {
        var that = this, bAnd = !!oMultiFilter.bAnd, aFilters = oMultiFilter.aFilters, oFilter, bMatch, bResult = bAnd;
        for (var i = 0; i < aFilters.length; i++) {
            oFilter = aFilters[i];
            bMatch = that._evaluateFilter(oFilter, vRef, fnGetValue);
            if (bAnd) {
                if (!bMatch) {
                    bResult = false;
                    break;
                }
            }
            else if (bMatch) {
                bResult = true;
                break;
            }
        }
        return bResult;
    }
    static normalizeFilterValue(vValue: any, bCaseSensitive: any) {
        var sResult;
        if (typeof vValue == "string") {
            if (bCaseSensitive === undefined) {
                bCaseSensitive = false;
            }
            if (this._normalizeCache[bCaseSensitive].hasOwnProperty(vValue)) {
                return this._normalizeCache[bCaseSensitive][vValue];
            }
            sResult = vValue;
            if (!bCaseSensitive) {
                sResult = sResult.toUpperCase();
            }
            sResult = sResult.normalize("NFC");
            this._normalizeCache[bCaseSensitive][vValue] = sResult;
            return sResult;
        }
        if (vValue instanceof Date) {
            return vValue.getTime();
        }
        return vValue;
    }
    static getFilterFunction(oFilter: any) {
        if (oFilter.fnTest) {
            return oFilter.fnTest;
        }
        var oValue1 = oFilter.oValue1, oValue2 = oFilter.oValue2, fnCompare = oFilter.fnCompare || Filter.defaultComparator;
        if (!oFilter.fnCompare || oFilter.bCaseSensitive !== undefined) {
            oValue1 = oValue1 ? this.normalizeFilterValue(oValue1, oFilter.bCaseSensitive) : oValue1;
            oValue2 = oValue2 ? this.normalizeFilterValue(oValue2, oFilter.bCaseSensitive) : oValue2;
        }
        var fnContains = function (value) {
            if (value == null) {
                return false;
            }
            if (typeof value != "string") {
                throw new Error("Only \"String\" values are supported for the FilterOperator: \"Contains\".");
            }
            return value.indexOf(oValue1) != -1;
        };
        var fnStartsWith = function (value) {
            if (value == null) {
                return false;
            }
            if (typeof value != "string") {
                throw new Error("Only \"String\" values are supported for the FilterOperator: \"StartsWith\".");
            }
            return value.indexOf(oValue1) == 0;
        };
        var fnEndsWith = function (value) {
            if (value == null) {
                return false;
            }
            if (typeof value != "string") {
                throw new Error("Only \"String\" values are supported for the FilterOperator: \"EndsWith\".");
            }
            var iPos = value.lastIndexOf(oValue1);
            if (iPos == -1) {
                return false;
            }
            return iPos == value.length - oValue1.length;
        };
        var fnBetween = function (value) {
            return (fnCompare(value, oValue1) >= 0) && (fnCompare(value, oValue2) <= 0);
        };
        switch (oFilter.sOperator) {
            case "EQ":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) === 0; };
                break;
            case "NE":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) !== 0; };
                break;
            case "LT":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) < 0; };
                break;
            case "LE":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) <= 0; };
                break;
            case "GT":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) > 0; };
                break;
            case "GE":
                oFilter.fnTest = function (value) { return fnCompare(value, oValue1) >= 0; };
                break;
            case "BT":
                oFilter.fnTest = fnBetween;
                break;
            case "NB":
                oFilter.fnTest = function (value) {
                    return !fnBetween(value);
                };
                break;
            case "Contains":
                oFilter.fnTest = fnContains;
                break;
            case "NotContains":
                oFilter.fnTest = function (value) {
                    return !fnContains(value);
                };
                break;
            case "StartsWith":
                oFilter.fnTest = fnStartsWith;
                break;
            case "NotStartsWith":
                oFilter.fnTest = function (value) {
                    return !fnStartsWith(value);
                };
                break;
            case "EndsWith":
                oFilter.fnTest = fnEndsWith;
                break;
            case "NotEndsWith":
                oFilter.fnTest = function (value) {
                    return !fnEndsWith(value);
                };
                break;
            default:
                Log.error("The filter operator \"" + oFilter.sOperator + "\" is unknown, filter will be ignored.");
                oFilter.fnTest = function (value) { return true; };
        }
        return oFilter.fnTest;
    }
}