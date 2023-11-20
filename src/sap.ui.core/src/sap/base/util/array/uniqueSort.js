/*!
 * ${copyright}
 */
sap.ui.define(['sap/base/assert'], function(assert) {
	"use strict";

	/**
	 * Sorts the given array in-place and removes any duplicates (identified by "===").
	 *
	 * Uses Array#sort()
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
	 *
	 * Use <code>jQuery.uniqueSort()</code> for arrays of DOMElements.
	 *
	 * @function
	 * @since 1.58
	 * @param {any[]} aArray An Array of any type
	 * @alias module:sap/base/util/array/uniqueSort
	 * @return {any[]} Same array as given (for chaining)
	 * @public
	 */
	var fnUniqueSort = function(aArray) {
		assert(Array.isArray(aArray), "uniqueSort: input parameter must be an Array");
		var iLength = aArray.length;
		if ( iLength > 1 ) {
			aArray.sort();
			var j = 0;
			for (var i = 1; i < iLength; i++) {
				// invariant: i is the entry to check, j is the last unique entry known so far
				if ( aArray.indexOf(aArray[i]) === i ) {
					aArray[++j] = aArray[i];
				}
			}
			// cut off the rest - if any
			if ( ++j < iLength ) {
				aArray.splice(j, iLength - j);
			}
		}
		return aArray;
	};
	return fnUniqueSort;
});
