/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/util/values"
], function(
	values
) {
	"use strict";

	/**
	 * Compares 2 values based on SameValueZero comparison
	 * @param a
	 * @param b
	 * @returns {boolean}
	 * @see http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero
	 */
	function equals(a, b) {
		// self comparison to ensure that NaN and NaN return true
		/*eslint-disable no-self-compare*/
		return a === b || (a !== a && b !== b);
		/*eslint-disable no-self-compare*/
	}

	/**
	 * Checks if value is included in collection
	 *
	* <pre>
	*     sap.ui.require([sap/base/util/includes], function(includes){
	*         // arrays
	*         includes(["1", "8", "7"], "8");         // true
	*         includes(["1", "8", "7"], "8", 0);      // true
	*
	*         includes(["1", "8", "7"], "8", 1);      // true
	*         includes(["1", "8", "7"], "8", 2);      // false
	*         includes(["1", "8", "7"], "8", 3);      // false
	*
	*         includes(["1", "8", "7"], "8", -1);     // false
	*         includes(["1", "8", "7"], "8", -2);     // true
	*         includes(["1", "8", "7"], "8", -3);     // true
	*
	*         // strings
	*         includes("187", "8");                   // true
	*         includes("187", "8", 0);                // true
	*
	*         includes("187", "8", 1);                // true
	*         includes("187", "8", 2);                // false
	*         includes("187", "8", 3);                // false
	*
	*         includes("187", "8", -1);               // false
	*         includes("187", "8", -2);               // true
	*         includes("187", "8", -3);               // true
	*     });
	* </pre>
	 *
	 * @function
	 * @exports sap/base/util/includes
	 * @param {Array|object|string} vCollection - Collection to be checked
	 * @param {*} vValue - The value to be checked
	 * @param {int} [iFromIndex=0] - optional start index, negative start index will start from the end
	 * @returns {boolean} - true if value is in the collection, false otherwise
	 * @private
	 */
	var fnIncludes = function (vCollection, vValue, iFromIndex) {
		if (typeof iFromIndex !== 'number') {
			iFromIndex = 0;
		}

		// Use native (Array.prototype.includes, String.prototype.includes) includes functions if available
		if (Array.isArray(vCollection)) {
			if (typeof vCollection.includes === 'function') {
				return vCollection.includes(vValue, iFromIndex);
			}

			iFromIndex = iFromIndex < 0 ? iFromIndex + vCollection.length : iFromIndex;
			iFromIndex = iFromIndex < 0 ? 0 : iFromIndex;

			for (var i = iFromIndex; i < vCollection.length; i++) {
				if (equals(vCollection[i], vValue)) {
					return true;
				}
			}
			return false;
		} else if (typeof vCollection === 'string') {
			iFromIndex = iFromIndex < 0 ? vCollection.length + iFromIndex : iFromIndex;
			if (typeof vCollection.includes === 'function') {
				return vCollection.includes(vValue, iFromIndex);
			}
			return vCollection.indexOf(vValue, iFromIndex) !== -1;
		} else {
			// values(...) always returns an array therefore deep recursion is avoided
			return fnIncludes(values(vCollection), vValue, iFromIndex);
		}
	};
	return fnIncludes;
});