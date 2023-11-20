/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/values"
], function(
	values
) {
	"use strict";

	/**
	* Checks if value is included in collection.
	*
	* @example
	* sap.ui.require(["sap/base/util/includes"], function(includes){
	*   // arrays
	*   includes(["1", "8", "7"], "8");         // true
	*   includes(["1", "8", "7"], "8", 0);      // true
	*
	*   includes(["1", "8", "7"], "8", 1);      // true
	*   includes(["1", "8", "7"], "8", 2);      // false
	*   includes(["1", "8", "7"], "8", 3);      // false
	*
	*   includes(["1", "8", "7"], "8", -1);     // false
	*   includes(["1", "8", "7"], "8", -2);     // true
	*   includes(["1", "8", "7"], "8", -3);     // true
	*
	*   // strings
	*   includes("187", "8");                   // true
	*   includes("187", "8", 0);                // true
	*
	*   includes("187", "8", 1);                // true
	*   includes("187", "8", 2);                // false
	*   includes("187", "8", 3);                // false
	*
	*   includes("187", "8", -1);               // false
	*   includes("187", "8", -2);               // true
	*   includes("187", "8", -3);               // true
	* });
	*
	*
	* @function
	* @since 1.58
	* @alias module:sap/base/util/includes
	* @param {Array|object|string} vCollection - Collection to be checked
	* @param {*} vValue - The value to be checked
	* @param {int} [iFromIndex=0] - optional start index, negative start index will start from the end
	* @returns {boolean} - true if value is in the collection, false otherwise
	* @public
	* @deprecated as of version 1.90. Use the <code>Array.prototype.includes</code> or <code>String.prototype.includes</code> instead, but note that <code>Array.prototype.includes</code> or <code>String.prototype.includes</code> fail when called on null values.
	*/
	var fnIncludes = function (vCollection, vValue, iFromIndex) {
		if (typeof iFromIndex !== 'number') {
			iFromIndex = 0;
		}

		// Use native (Array.prototype.includes, String.prototype.includes) includes functions if available
		if (Array.isArray(vCollection) || typeof vCollection === 'string') {
			if (iFromIndex < 0) {
				iFromIndex = (vCollection.length + iFromIndex) < 0 ? 0 : vCollection.length + iFromIndex;
			}
			return vCollection.includes(vValue, iFromIndex);
		} else {
			// values(...) always returns an array therefore deep recursion is avoided
			return fnIncludes(values(vCollection), vValue, iFromIndex);
		}
	};
	return fnIncludes;
});
