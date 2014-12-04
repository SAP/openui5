/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";
	
	/**
	 * Clientside Sorter processor
	 * @namespace sap.ui.model.SorterProcessor
	 */
	var SorterProcessor = {};

	/**
	 * Sorts the list
	 * 
	 * Sorters are applied according to their order in the sorter array.
	 * 
	 * @param {array} aData the data array to be sorted
	 * @param {array} aSorters the sorter array
	 * @param {function} fnGetValue the method to get the actual value use for sorting
	 * @public
	 */
	SorterProcessor.apply = function(aData, aSorters, fnGetValue){
		var that = this,
			aSortValues = [],
			aCompareFunctions = [],
			oValue,
			oSorter;
	
		if (!aSorters || aSorters.length == 0) {
			return aData;
		}
		
		function fnCompare(a, b) {
			if (b == null) {
				return -1;
			}
			if (a == null) {
				return 1;
			}
			if (typeof a == "string" && typeof b == "string") {
				return a.localeCompare(b);
			}
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		}
		
		for (var j = 0; j < aSorters.length; j++) {
			oSorter = aSorters[j];
			aCompareFunctions[j] = oSorter.fnCompare;
			
			if (!aCompareFunctions[j]) {
				aCompareFunctions[j] = fnCompare;
			}
			/*eslint-disable no-loop-func */
			jQuery.each(aData, function(i, vRef) {
				oValue = fnGetValue(vRef, oSorter.sPath);
				if (typeof oValue == "string") {
					oValue = oValue.toLocaleUpperCase();
				}
				if (!aSortValues[j]) {
					aSortValues[j] = [];
				}
				aSortValues[j][vRef] = oValue;
			});
			/*eslint-enable no-loop-func */
		}
	
		aData.sort(function(a, b) {
			var valueA = aSortValues[0][a],
				valueB = aSortValues[0][b];
			
			return that._applySortCompare(aSorters, a, b, valueA, valueB, aSortValues, aCompareFunctions, 0);
		});
		
		return aData;
	};
	
	SorterProcessor._applySortCompare = function(aSorters, a, b, valueA, valueB, aSortValues, aCompareFunctions, iDepth){
		var oSorter = aSorters[iDepth],
			fnCompare = aCompareFunctions[iDepth],
			returnValue;
	
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
	};
	
	return SorterProcessor;
	
});
	