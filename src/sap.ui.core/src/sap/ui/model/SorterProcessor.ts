import Sorter from "./Sorter";
import each from "sap/base/util/each";
export class SorterProcessor {
    static apply(aData: any, aSorters: any, fnGetValue: any, fnGetKey: any) {
        var that = this, aSortValues = [], aCompareFunctions = [], oValue, oSorter;
        if (!aSorters || aSorters.length == 0) {
            return aData;
        }
        for (var j = 0; j < aSorters.length; j++) {
            oSorter = aSorters[j];
            aCompareFunctions[j] = oSorter.fnCompare || Sorter.defaultComparator;
            each(aData, function (i, vRef) {
                oValue = fnGetValue(vRef, oSorter.sPath);
                if (typeof oValue == "string") {
                    oValue = oValue.toLocaleUpperCase();
                }
                if (!aSortValues[j]) {
                    aSortValues[j] = [];
                }
                if (fnGetKey) {
                    vRef = fnGetKey(vRef);
                }
                aSortValues[j][vRef] = oValue;
            });
        }
        aData.sort(function (a, b) {
            if (fnGetKey) {
                a = fnGetKey(a);
                b = fnGetKey(b);
            }
            var valueA = aSortValues[0][a], valueB = aSortValues[0][b];
            return that._applySortCompare(aSorters, a, b, valueA, valueB, aSortValues, aCompareFunctions, 0);
        });
        return aData;
    }
    private static _applySortCompare(aSorters: any, a: any, b: any, valueA: any, valueB: any, aSortValues: any, aCompareFunctions: any, iDepth: any) {
        var oSorter = aSorters[iDepth], fnCompare = aCompareFunctions[iDepth], returnValue;
        returnValue = fnCompare(valueA, valueB);
        if (oSorter.bDescending) {
            returnValue = -returnValue;
        }
        if (returnValue == 0 && aSorters[iDepth + 1]) {
            valueA = aSortValues[iDepth + 1][a];
            valueB = aSortValues[iDepth + 1][b];
            returnValue = this._applySortCompare(aSorters, a, b, valueA, valueB, aSortValues, aCompareFunctions, iDepth + 1);
        }
        return returnValue;
    }
}