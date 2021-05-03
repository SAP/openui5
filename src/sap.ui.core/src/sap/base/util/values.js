/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Returns values from an object.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/util/values
	 * @param {object} mObject - Object to be extracted
	 * @returns {Array.<*>} - array of object values, if object does not contain values, an empty array will be returned
	 * @public
	 * @deprecated as of version 1.90. Use the <code>Object.values</code> instead.
	 */
	var fnValues = function values(mObject) {
		// Default is always an empty array
		if (
			typeof mObject === "undefined"
			|| mObject === null
			|| mObject !== mObject // eslint-disable-line no-self-compare
		) {
			return [];
		}

			return Object.values(mObject);
	};

	return fnValues;
});
