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
	 * @param {any[]} a An Array of any type
	 * @exports sap/base/util/unique
	 * @return {any[]} Same array as given (for chaining)
	 * @private
	 */
	var fnUnique = function(a) {
		assert(a instanceof Array, "unique: a must be an array");
		var l = a.length;
		if ( l > 1 ) {
			a.sort();
			var j = 0;
			for (var i = 1; i < l; i++) {
				// invariant: i is the entry to check, j is the last unique entry known so far
				if ( a[i] !== a[j] ) {
					a[++j] = a[i];
				}
			}
			// cut off the rest - if any
			if ( ++j < l ) {
				a.splice(j, l - j);
			}
		}
		return a;
	};
	return fnUnique;
});
