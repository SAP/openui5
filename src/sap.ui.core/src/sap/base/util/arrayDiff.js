/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/util/equal'], function(equal) {
	"use strict";

	/**
	 * Calculate delta of old list and new list.
	 *
	 * This partly implements the algorithm described in "A Technique for Isolating Differences Between Files"
	 * but instead of working with hashes, it does compare each entry of the old list with each entry of the new
	 * list, which causes terrible performance on large datasets.
	 *
	 * @deprecated As of 1.38, use {@link sap/base/util/arraySymbolDiff} instead if applicable
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnCompare] Function to compare list entries
	 * @param {boolean} [bUniqueEntries] Whether entries are unique, so no duplicate entries exist
	 * @exports sap/base/util/arrayDiff
	 * @return {Array} List of changes
	 * @private
	 */
	var fnArrayDiff = function(aOld, aNew, fnCompare, bUniqueEntries){
		fnCompare = fnCompare || function(vValue1, vValue2) {
			return equal(vValue1, vValue2);
		};

		var aOldRefs = [];
		var aNewRefs = [];

		//Find references
		var aMatches = [];
		for (var i = 0; i < aNew.length; i++) {
			var oNewEntry = aNew[i];
			var iFound = 0;
			var iTempJ;
			// if entries are unique, first check for whether same index is same entry
			// and stop searching as soon the first matching entry is found
			if (bUniqueEntries && fnCompare(aOld[i], oNewEntry)) {
				iFound = 1;
				iTempJ = i;
			} else {
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
				} else {
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

		//Pass 4: Find adjacent matches in ascending order
		for (var i = 0; i < aNew.length - 1; i++) {
			if (aNewRefs[i] &&
				!aNewRefs[i + 1] &&
				aNewRefs[i].row + 1 < aOld.length &&
				!aOldRefs[aNewRefs[i].row + 1] &&
				fnCompare(aOld[ aNewRefs[i].row + 1 ], aNew[i + 1])) {

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

		//Pass 5: Find adjacent matches in descending order
		for (var i = aNew.length - 1; i > 0; i--) {
			if (aNewRefs[i] &&
				!aNewRefs[i - 1] &&
				aNewRefs[i].row > 0 &&
				!aOldRefs[aNewRefs[i].row - 1] &&
				fnCompare(aOld[aNewRefs[i].row - 1], aNew[i - 1])) {

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

		//Pass 6: Generate diff data
		var aDiff = [];

		if (aNew.length == 0) {
			//New list is empty, all items were deleted
			for (var i = 0; i < aOld.length; i++) {
				aDiff.push({
					index: 0,
					type: 'delete'
				});
			}
		} else {
			var iNewListIndex = 0;
			if (!aOldRefs[0]) {
				//Detect all deletions at the beginning of the old list
				for (var i = 0; i < aOld.length && !aOldRefs[i]; i++) {
					aDiff.push({
						index: 0,
						type: 'delete'
					});
					iNewListIndex = i + 1;
				}
			}

			for (var i = 0; i < aNew.length; i++) {
				if (!aNewRefs[i] || aNewRefs[i].row > iNewListIndex) {
					//Entry doesn't exist in old list = insert
					aDiff.push({
						index: i,
						type: 'insert'
					});
				} else {
					iNewListIndex = aNewRefs[i].row + 1;
					for (var j = aNewRefs[i].row + 1; j < aOld.length && (!aOldRefs[j] || aOldRefs[j].row < i); j++) {
						aDiff.push({
							index: i + 1,
							type: 'delete'
						});
						iNewListIndex = j + 1;
					}
				}
			}
		}

		return aDiff;
	};

	return fnArrayDiff;
});
