/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/assert'], function(assert) {
	"use strict";

	/**
	 * Sorts the given array in-place and removes any duplicates (identified by "===").
	 *
	 * Use <code>jQuery.unique()</code> for arrays of DOMElements.
	 *
	 * @function
	 * @param {any[]} aArray An Array of any type
	 * @exports sap/base/util/array/uniqueSort
	 * @return {any[]} Same array as given (for chaining)
	 * @private
	 */
	var fnUniqueSort = function(aArray) {
		assert(aArray instanceof Array, "uniqueSort: input parameter must be an Array");
		var l = aArray.length;
		if ( l > 1 ) {
			aArray.sort();
			var j = 0;
			for (var i = 1; i < l; i++) {
				// invariant: i is the entry to check, j is the last unique entry known so far
				if ( aArray[i] !== aArray[j] ) {
					aArray[++j] = aArray[i];
				}
			}
			// cut off the rest - if any
			if ( ++j < l ) {
				aArray.splice(j, l - j);
			}
		}
		return aArray;
	};
	return fnUniqueSort;
});
