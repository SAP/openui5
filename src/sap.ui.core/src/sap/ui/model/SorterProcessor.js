/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Sorter'],
	function(jQuery, Sorter) {
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
	 * @param {function} [fnGetKey] method to get a key value for the given data entry
	 * @return {array} the given array instance after applying the sort order
	 *
	 * @public
	 */
	SorterProcessor.apply = function(aData, aSorters, fnGetValue, fnGetKey){
		var that = this,
			aSortValues = [],
			aCompareFunctions = [],
			oValue,
			oSorter;

		if (!aSorters || aSorters.length == 0) {
			return aData;
		}

		for (var j = 0; j < aSorters.length; j++) {
			oSorter = aSorters[j];
			aCompareFunctions[j] = oSorter.fnCompare || Sorter.defaultComparator;

			/*eslint-disable no-loop-func */
			jQuery.each(aData, function(i, vRef) {
				oValue = fnGetValue(vRef, oSorter.sPath);
				if (typeof oValue == "string") {
					oValue = oValue.toLocaleUpperCase();
				}
				if (!aSortValues[j]) {
					aSortValues[j] = [];
				}

				// When the data array might contain objects, e.g. in the ClientTreeBinding
				if (fnGetKey) {
					vRef = fnGetKey(vRef);
				}

				aSortValues[j][vRef] = oValue;
			});
			/*eslint-enable no-loop-func */
		}

		aData.sort(function(a, b) {
			if (fnGetKey) {
				a = fnGetKey(a);
				b = fnGetKey(b);
			}

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

